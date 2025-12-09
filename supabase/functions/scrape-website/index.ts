import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScrapeRequest {
  url: string;
  keywords?: string[];
  useGemini?: boolean;
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: {
      title?: string;
      description?: string;
      keywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    };
    links?: string[];
  };
}

function extractLinks(html: string, baseUrl: string): Array<{ text: string; url: string }> {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  const links: Array<{ text: string; url: string }> = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].trim() || href;

    try {
      const fullUrl = new URL(href, baseUrl).toString();
      if (links.length < 20 && text && href) {
        links.push({ text, url: fullUrl });
      }
    } catch {
      continue;
    }
  }

  return links;
}

function extractKeywordContent(content: string, keywords: string[]): Array<{ text: string; importance: string }> {
  if (!keywords || keywords.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 50).slice(0, 4);
    return sentences.map((s, i) => ({
      text: s.trim(),
      importance: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
    }));
  }

  const highlighted: Array<{ text: string; importance: string }> = [];
  const paragraphs = content.split('\n').filter(p => p.trim().length > 30);

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    for (const para of paragraphs) {
      if (para.toLowerCase().includes(keywordLower)) {
        const sentences = para.split(/[.!?]+/).filter(s =>
          s.toLowerCase().includes(keywordLower) && s.trim().length > 20
        );

        for (const sentence of sentences) {
          if (highlighted.length < 6) {
            highlighted.push({
              text: sentence.trim(),
              importance: highlighted.length < 2 ? 'high' : highlighted.length < 4 ? 'medium' : 'low'
            });
          }
        }
      }
    }
  }

  return highlighted.length > 0 ? highlighted : [{
    text: paragraphs[0] || 'Content extracted from website',
    importance: 'high'
  }];
}

async function generateAISummary(content: string, keywords: string[], url: string, useGemini: boolean): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('VITE_GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    return `Analysis of ${new URL(url).hostname}: ${content.slice(0, 300)}...`;
  }

  const prompt = keywords.length > 0
    ? `Analyze this website content and provide a comprehensive summary focusing on these keywords: ${keywords.join(', ')}. Include key insights, main features, and relevant information about these topics.\n\nContent: ${content.slice(0, 3000)}`
    : `Analyze this website content and provide a comprehensive summary of its main purpose, features, and key information.\n\nContent: ${content.slice(0, 3000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return summary || `Analysis of ${new URL(url).hostname}: ${content.slice(0, 300)}...`;
  } catch (error) {
    console.error('Gemini API error:', error);
    return `Analysis of ${new URL(url).hostname}: ${content.slice(0, 300)}...`;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url, keywords = [], useGemini = true }: ScrapeRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('VITE_FIRECRAWL_API_KEY');

    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
      })
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const scrapeData: FirecrawlResponse = await firecrawlResponse.json();

    if (!scrapeData.success || !scrapeData.data) {
      throw new Error('Failed to scrape website content');
    }

    const { data } = scrapeData;
    const content = data.markdown || data.html || '';
    const metadata = data.metadata || {};

    const extractedKeywords = keywords.length > 0
      ? keywords
      : (metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()).slice(0, 5) : ['web', 'content']);

    const links = data.html ? extractLinks(data.html, url) : [];
    const highlightedContent = extractKeywordContent(content, keywords);
    const aiSummary = await generateAISummary(content, keywords, url, useGemini);

    const result = {
      success: true,
      data: {
        url: url,
        title: metadata.title || metadata.ogTitle || new URL(url).hostname,
        meta_description: metadata.description || metadata.ogDescription || `Content from ${new URL(url).hostname}`,
        keywords: extractedKeywords,
        links: links.slice(0, 15),
        highlighted_content: highlightedContent,
        og_data: {
          title: metadata.ogTitle || metadata.title || '',
          description: metadata.ogDescription || metadata.description || '',
          image: metadata.ogImage || '',
          type: 'website',
        },
        raw_content: content.slice(0, 2000),
        ai_summary: aiSummary,
      },
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape website',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});