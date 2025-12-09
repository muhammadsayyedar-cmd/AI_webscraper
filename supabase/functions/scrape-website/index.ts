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

function cleanContent(content: string): string {
  // Remove navigation links and unwanted elements
  let cleaned = content
    // Remove markdown links like [Jump to content](url)
    .replace(/\[Jump to [^\]]+\]\([^)]+\)/gi, '')
    // Remove standalone navigation phrases
    .replace(/^(Skip to |Jump to |Go to )[^\n]+$/gmi, '')
    // Remove date banners like "December 8: An important update..."
    .replace(/^[A-Za-z]+ \d+: [^\n]+$/gmi, '')
    // Remove "LIVE" and similar status indicators
    .replace(/^\s*LIVE\s*$/gmi, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

function extractKeywordContent(content: string, keywords: string[]): Array<{ text: string; importance: number }> {
  // Clean content first
  const cleaned = cleanContent(content);

  if (!keywords || keywords.length === 0) {
    const sentences = cleaned.split(/[.!?]+/)
      .filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 50 && !trimmed.match(/^(Skip|Jump|LIVE)/i);
      })
      .slice(0, 4);
    return sentences.map((s, i) => ({
      text: s.trim(),
      importance: 10 - i * 2
    }));
  }

  const highlighted: Array<{ text: string; importance: number }> = [];
  const paragraphs = cleaned.split('\n')
    .filter(p => {
      const trimmed = p.trim();
      return trimmed.length > 50 && !trimmed.match(/^[\[\(]/);
    });

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    for (const para of paragraphs) {
      if (para.toLowerCase().includes(keywordLower)) {
        const sentences = para.split(/[.!?]+/).filter(s =>
          s.toLowerCase().includes(keywordLower) && s.trim().length > 30
        );

        for (const sentence of sentences) {
          if (highlighted.length < 6) {
            highlighted.push({
              text: sentence.trim(),
              importance: 10 - highlighted.length
            });
          }
        }
      }
    }
  }

  // If no keyword matches, get first meaningful paragraph
  if (highlighted.length === 0) {
    const firstPara = paragraphs.find(p => p.length > 100);
    if (firstPara) {
      highlighted.push({
        text: firstPara.substring(0, 200),
        importance: 8
      });
    }
  }

  return highlighted.length > 0 ? highlighted : [{
    text: 'Content extracted from website',
    importance: 5
  }];
}

async function generateGeminiAnalysis(content: string, keywords: string[], url: string, title: string): Promise<any> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('VITE_GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not found, using fallback');
    return createFallbackAnalysis(content, keywords, title);
  }

  const keywordInstruction = keywords.length > 0
    ? `CRITICAL: Focus EXCLUSIVELY on: ${keywords.join(', ')}. ONLY extract content related to these keywords.`
    : 'Analyze the main content thoroughly.';

  const prompt = `You are a web intelligence assistant. Analyze this content and provide comprehensive insights.

${keywordInstruction}

URL: ${url}
Title: ${title}
Content:
${content.substring(0, 10000)}

Provide your analysis in this structure:

**SOURCE SUMMARY:**
Provide 4-5 DETAILED paragraphs (minimum 400 words) explaining what this content is about. Include key facts, statistics, names, dates, and important details.

**SHORT SUMMARY:**
Provide a 250-300 word summary with key facts and main points.

**KEY HIGHLIGHTS:**
List 8-10 DETAILED bullet points. Each should be 2-3 sentences with specific facts, numbers, and context.

**VERIFIED ORIGIN / MOMENT OF TRUTH:**
Provide historical context:
- When did this topic originate?
- Key historical milestones
- Important dates and events

**LATEST UPDATES & FUTURE FORECAST:**
Analyze current state and trends:
- Current status (2024-2025)
- Recent developments
- Emerging trends
- Future predictions

${keywords.length > 0 ? `**KEYWORD RELEVANCE SCORE:**
Rate relevance to "${keywords.join(', ')}" from 0-10.
Format: "Score: X/10"` : ''}

**SOCIAL MEDIA POSTS:**

LinkedIn Post (Professional, 300-400 characters):
[Write engaging professional post with facts]

Twitter/X Post (Under 280 characters with 2-3 hashtags):
[Write attention-grabbing post with stats]

Instagram Caption (150-200 words with 8-10 hashtags):
[Write engaging narrative with hashtags]

Facebook Post (200-300 words, conversational):
[Write conversational post that encourages engagement]`;

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
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return createFallbackAnalysis(content, keywords, title);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiResponse) {
      return createFallbackAnalysis(content, keywords, title);
    }

    return parseGeminiResponse(aiResponse, content, keywords);
  } catch (error) {
    console.error('Gemini error:', error);
    return createFallbackAnalysis(content, keywords, title);
  }
}

function createFallbackAnalysis(content: string, keywords: string[], title: string) {
  // Clean the content first
  const cleanedContent = cleanContent(content);

  // Extract meaningful paragraphs (skip short ones and navigation)
  const paragraphs = cleanedContent
    .split(/\n\n+/)
    .filter(p => {
      const trimmed = p.trim();
      return (
        trimmed.length > 100 && // Longer paragraphs only
        !trimmed.match(/^[\[\(]/) && // Skip if starts with [ or (
        !trimmed.match(/^(Skip|Jump|Go to|LIVE|Menu)/i) // Skip navigation
      );
    });

  // Get the best summary paragraphs
  const summaryParagraphs = paragraphs.slice(0, 3);
  const summary = summaryParagraphs.join('\n\n') || `${title} - Content extracted from website.`;

  const keywordText = keywords.length > 0 ? ` about ${keywords.join(', ')}` : '';

  // Create better social media posts
  const firstSentence = summaryParagraphs[0]?.split(/[.!?]/)[0] || title;
  const shortDesc = summary.substring(0, 200).replace(/\n/g, ' ');

  return {
    sourceSummary: summary,
    shortSummary: summary.substring(0, 400),
    verifiedOrigin: `Information about ${title}${keywordText}. This content provides an overview of the topic with key details and context.`,
    futureForcast: `Current information${keywordText} as of 2024. This represents the latest available data on the subject.`,
    keyInsights: paragraphs.slice(0, 8).map((text, i) => ({ text: text.substring(0, 200), importance: 10 - i })),
    keywordRelevanceScore: keywords.length > 0 ? 5 : undefined,
    linkedinPost: `${firstSentence}. Learn more about ${title}${keywordText}. #${title.replace(/\s+/g, '')} #Industry #Knowledge`,
    twitterPost: `${firstSentence.substring(0, 200)}${keywordText} 🔍 #${title.replace(/\s+/g, '').substring(0, 20)}`,
    instagramCaption: `${shortDesc}\n\n${keywordText ? `🔍 Focus: ${keywords.join(', ')}\n\n` : ''}#${title.replace(/\s+/g, '').substring(0, 20)} #knowledge #learning #education #information #discover #explore #facts #insights`,
    facebookPost: `${summary.substring(0, 300)}\n\nInterested in learning more${keywordText}? This comprehensive overview covers the essential aspects and latest information.`
  };
}

function parseGeminiResponse(text: string, content: string, keywords: string[]) {
  const result: any = {};

  const summaryMatch = text.match(/\*\*SOURCE SUMMARY:?\*\*\s*([\s\S]*?)(?=\*\*SHORT SUMMARY|\*\*KEY HIGHLIGHTS|$)/i);
  if (summaryMatch) {
    result.sourceSummary = summaryMatch[1].trim();
  }

  const shortMatch = text.match(/\*\*SHORT SUMMARY:?\*\*\s*([\s\S]*?)(?=\*\*KEY HIGHLIGHTS|$)/i);
  if (shortMatch) {
    result.shortSummary = shortMatch[1].trim();
  }

  const highlightsMatch = text.match(/\*\*KEY HIGHLIGHTS:?\*\*\s*([\s\S]*?)(?=\*\*VERIFIED ORIGIN|$)/i);
  if (highlightsMatch) {
    const bulletPoints = highlightsMatch[1]
      .split('\n')
      .filter(line => line.trim().match(/^[\d\-\*•]/))
      .slice(0, 10)
      .map(point => point.replace(/^[\d\-\*•.\s]+/, '').trim())
      .filter(text => text.length > 10);

    result.keyHighlights = bulletPoints;
    result.keyInsights = bulletPoints.map((text, i) => ({ text, importance: 10 - i }));
  }

  const originMatch = text.match(/\*\*VERIFIED ORIGIN[^*]*:?\*\*\s*([\s\S]*?)(?=\*\*LATEST UPDATES|$)/i);
  if (originMatch) {
    result.verifiedOrigin = originMatch[1].trim();
  }

  const forecastMatch = text.match(/\*\*LATEST UPDATES[^*]*:?\*\*\s*([\s\S]*?)(?=\*\*KEYWORD RELEVANCE|\*\*SOCIAL MEDIA|$)/i);
  if (forecastMatch) {
    result.futureForcast = forecastMatch[1].trim();
  }

  const scoreMatch = text.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  if (scoreMatch) {
    result.keywordRelevanceScore = parseFloat(scoreMatch[1]);
  }

  const linkedinMatch = text.match(/LinkedIn Post[^:]*:\s*([\s\S]*?)(?=Twitter|Instagram|$)/i);
  if (linkedinMatch) {
    result.linkedinPost = linkedinMatch[1].replace(/\[Write[^\]]*\]/gi, '').trim();
  }

  const twitterMatch = text.match(/Twitter[^\n]*Post[^:]*:\s*([\s\S]*?)(?=Instagram|Facebook|$)/i);
  if (twitterMatch) {
    result.twitterPost = twitterMatch[1].replace(/\[Write[^\]]*\]/gi, '').trim();
  }

  const instagramMatch = text.match(/Instagram Caption[^:]*:\s*([\s\S]*?)(?=Facebook|$)/i);
  if (instagramMatch) {
    result.instagramCaption = instagramMatch[1].replace(/\[Write[^\]]*\]/gi, '').trim();
  }

  const facebookMatch = text.match(/Facebook Post[^:]*:\s*([\s\S]*?)(?=\*\*|$)/i);
  if (facebookMatch) {
    result.facebookPost = facebookMatch[1].replace(/\[Write[^\]]*\]/gi, '').trim();
  }

  if (!result.sourceSummary) {
    const fallback = createFallbackAnalysis(content, keywords, '');
    return { ...fallback, ...result };
  }

  return result;
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

    console.log('🔥 Scraping:', url);

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
    const pageTitle = metadata.title || metadata.ogTitle || new URL(url).hostname;

    console.log('✅ Scraped successfully, analyzing...');

    const extractedKeywords = keywords.length > 0
      ? keywords
      : (metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()).slice(0, 5) : []);

    const links = data.html ? extractLinks(data.html, url) : [];
    const highlightedContent = extractKeywordContent(content, keywords);

    let analysis;
    if (useGemini) {
      analysis = await generateGeminiAnalysis(content, keywords, url, pageTitle);
    } else {
      analysis = createFallbackAnalysis(content, keywords, pageTitle);
    }

    const result = {
      success: true,
      data: {
        url: url,
        title: pageTitle,
        meta_description: analysis.sourceSummary || metadata.description || `Content from ${new URL(url).hostname}`,
        keywords: extractedKeywords,
        links: links.slice(0, 15),
        highlighted_content: analysis.keyInsights || highlightedContent,
        og_data: {
          title: metadata.ogTitle || metadata.title || '',
          description: metadata.ogDescription || metadata.description || '',
          image: metadata.ogImage || '',
          url: url,
        },
        raw_content: content.slice(0, 2000),
        ai_summary: analysis.shortSummary || analysis.sourceSummary?.substring(0, 300) || '',
        verified_origin: analysis.verifiedOrigin || `Content from ${pageTitle}`,
        future_forecast: analysis.futureForcast || 'Current information as of 2024',
        keyword_relevance_score: analysis.keywordRelevanceScore,
        linkedin_post: analysis.linkedinPost || '',
        twitter_post: analysis.twitterPost || '',
        instagram_caption: analysis.instagramCaption || '',
        facebook_post: analysis.facebookPost || '',
        key_highlights: analysis.keyHighlights || [],
        short_summary: analysis.shortSummary || '',
      },
    };

    console.log('✅ Analysis complete');

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