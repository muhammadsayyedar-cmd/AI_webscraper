import { supabase, ScrapeData } from '../lib/supabase';

const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY || '';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ==============================================
// FIRECRAWL API INTEGRATION - FIXED
// ==============================================

interface FireCrawlScrapeOptions {
  url: string;
  keywords?: string[];
}

export async function scrapeWithFireCrawl(options: FireCrawlScrapeOptions) {
  const { url, keywords = [] } = options;

  if (!FIRECRAWL_API_KEY) throw new Error('FireCrawl API key is missing');

  try {
    const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        excludeTags: ['nav', 'footer', 'aside', 'script', 'style', 'banner'],
        waitFor: 2000,
      }),
    });

    if (!response.ok) throw new Error(`FireCrawl failed: ${response.status}`);

    const result = await response.json();
    const data = result.data || result;

    let cleanedContent = data.markdown || data.content || '';

    cleanedContent = cleanedContent
      .replace(/December \d+:.*?wikipedia.*?nonprofit.*?billionaire\.?/gis, '')
      .replace(/You deserve an explanation.*?\$2\.75.*?knowledge\.?/gis, '')
      .trim();

    return {
      success: true,
      data: {
        url,
        title: data.metadata?.title || 'No title',
        content: cleanedContent,
        markdown: cleanedContent,
        html: data.html || '',
        metadata: {
          title: data.metadata?.title || '',
          description: data.metadata?.description || '',
          keywords: data.metadata?.keywords || keywords,
          ogTitle: data.metadata?.ogTitle || '',
          ogDescription: data.metadata?.ogDescription || '',
          ogImage: data.metadata?.ogImage || '',
          ogUrl: url,
        },
        links: data.links || [],
      }
    };
  } catch (e) {
    console.error('FireCrawl error:', e);
    throw e;
  }
}

// ==============================================
// GEMINI AI — KEYWORD FOCUSED
// ==============================================

export async function analyzeWithGeminiResearch(content: string, keywords: string[], url: string, title?: string) {
  if (!GEMINI_API_KEY) {
    return createFallbackAnalysis(content, keywords, url, title);
  }

  try {
    const keywordInstruction = keywords.length
      ? `CRITICAL: Focus exclusively on these keywords: ${keywords.join(', ')}.`
      : `Analyze normally.`;

    const prompt = `
${keywordInstruction}

URL: ${url}
Content:
${content.substring(0, 10000)}

Return structured sections:
**SOURCE SUMMARY:**
**SHORT SUMMARY:**
**KEY HIGHLIGHTS:**
**VERIFIED ORIGIN:**
**LATEST UPDATES & FUTURE FORECAST:**
${keywords.length ? '**KEYWORD RELEVANCE SCORE:**' : ''}
**SOCIAL MEDIA POSTS:**
LinkedIn:
Twitter:
Instagram:
Facebook:
`;

    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
        }),
      }
    );

    if (!response.ok) {
      return createFallbackAnalysis(content, keywords, url, title);
    }

    const json = await response.json();
    const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiText) return createFallbackAnalysis(content, keywords, url, title);
    if (aiText.startsWith("NO KEYWORD MATCH")) return createFallbackAnalysis(content, keywords, url, title);

    return { success: true, ...parseResearchAnalysis(aiText, content, keywords) };

  } catch (err) {
    console.error('Gemini error:', err);
    return createFallbackAnalysis(content, keywords, url, title);
  }
}

// ==============================================
// FALLBACK (No AI or No Keyword Match)
// ==============================================

function createFallbackAnalysis(content: string, keywords: string[], url: string, title?: string) {
  let cleanedContent = content
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();

  let relevantContent = cleanedContent;
  let keywordMatchCount = 0;

  if (keywords.length) {
    const kws = keywords.flatMap(k =>
      k.split(/\s+/).filter(x => x.length > 2)
    );

    const searchable = `${title}\n${cleanedContent}`.toLowerCase();
    const matched = kws.filter(k => searchable.includes(k.toLowerCase()));

    if (matched.length === 0) {
      return {
        success: false,
        sourceSummary: `No content found for keywords: ${keywords.join(', ')}`,
        verifiedOrigin: `Scraped successfully but no keyword match.`,
        futureForcast: `No forecast possible.`,
        keyInsights: [],
        summary: `No match for ${keywords.join(', ')}`,
      };
    }

    const paragraphs = cleanedContent.split(/\n\n+/);
    const regex = new RegExp(matched.join('|'), 'gi');

    relevantContent = paragraphs
      .filter(p => regex.test(p))
      .join('\n\n');
  }

  const summary = relevantContent.split(/\n\n/)[0] || cleanedContent.substring(0, 300);

  return {
    success: true,
    sourceSummary: summary,
    verifiedOrigin: `Extracted from ${url}, filtered by keywords.`,
    futureForcast: `More details require Gemini.`,
    keyInsights: [{ text: summary, importance: 10 }],
    summary
  };
}

// ==============================================
// FULL PARSER FOR GEMINI STRUCTURED OUTPUT
// ==============================================

function parseResearchAnalysis(text: string, content: string, keywords: string[]) {
  const read = (title: string) => {
    const regex = new RegExp(`\\*\\*${title}:?\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, 'i');
    const match = text.match(regex);
    if (!match) return '';
    return match[0]
      .replace(new RegExp(`\\*\\*${title}:?\\*\\*`, 'i'), '')
      .trim();
  };

  const keyHighlightsBlock = read('KEY HIGHLIGHTS');
  const keyHighlights = keyHighlightsBlock
    .split('\n')
    .filter(l => /^[\-\*\•\d]/.test(l))
    .map(l => l.replace(/^[\-\*\•\d\.]+\s*/, '').trim());

  return {
    sourceSummary: read('SOURCE SUMMARY'),
    shortSummary: read('SHORT SUMMARY'),
    keyHighlights,
    verifiedOrigin: read('VERIFIED ORIGIN'),
    futureForcast: read('LATEST UPDATES & FUTURE FORECAST'),
    keywordRelevanceScore: (() => {
      const scoreStr = read('KEYWORD RELEVANCE SCORE');
      const match = scoreStr.match(/(\d+)\s*\/\s*10/);
      return match ? Number(match[1]) : undefined;
    })(),
    linkedinPost: read('LinkedIn Post') || read('LinkedIn'),
    twitterPost: read('Twitter') || read('Twitter/X Post'),
    instagramCaption: read('Instagram') || read('Instagram Caption'),
    facebookPost: read('Facebook') || read('Facebook Post'),
    keyInsights: keyHighlights.map((t, i) => ({ text: t, importance: 10 - i })),
    summary: read('SHORT SUMMARY') || read('SOURCE SUMMARY'),
  };
}

// ==============================================
// MAIN SCRAPING FUNCTION (Uses Edge Function)
// ==============================================

export async function performScrape(url: string, keywords: string[] = [], useGemini: boolean = true) {
  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/scrape-website`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        keywords,
        useGemini,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      throw new Error(`Scraping failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('performScrape error:', error);
    throw error;
  }
}

// ==============================================
// SAVE SCRAPE TO DATABASE
// ==============================================

export async function saveScrape(scrapeData: ScrapeData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('scrapes')
      .insert([{
        user_id: user.id,
        url: scrapeData.url,
        title: scrapeData.title,
        meta_description: scrapeData.meta_description,
        keywords: scrapeData.keywords,
        links: scrapeData.links,
        highlighted_content: scrapeData.highlighted_content,
        og_data: scrapeData.og_data,
        raw_content: scrapeData.raw_content,
        ai_summary: scrapeData.ai_summary,
        verified_origin: scrapeData.verified_origin,
        future_forecast: scrapeData.future_forecast,
        keyword_relevance_score: scrapeData.keyword_relevance_score,
        linkedin_post: scrapeData.linkedin_post,
        twitter_post: scrapeData.twitter_post,
        instagram_caption: scrapeData.instagram_caption,
        facebook_post: scrapeData.facebook_post,
        key_highlights: scrapeData.key_highlights,
        short_summary: scrapeData.short_summary,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('saveScrape error:', error);
    return { success: false, error };
  }
}