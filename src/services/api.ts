import { supabase, ScrapeData } from '../lib/supabase';

const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY || '';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// ==============================================
// FIRECRAWL API INTEGRATION - FIXED
// ==============================================

interface FireCrawlScrapeOptions {
  url: string;
  keywords?: string[];
}

export async function scrapeWithFireCrawl(options: FireCrawlScrapeOptions) {
  const { url, keywords = [] } = options;

  if (!FIRECRAWL_API_KEY) {
    throw new Error('FireCrawl API key is missing');
  }

  try {
    console.log('🔥 Calling FireCrawl API for:', url);
    console.log('🎯 With keywords:', keywords);

    // FIXED: Better scraping configuration to avoid banners
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
        // FIXED: Add these options to skip donation banners
        excludeTags: ['nav', 'footer', 'aside', 'script', 'style', 'banner'],
        waitFor: 2000, // Wait for page to load
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FireCrawl Error Response:', errorText);
      throw new Error(`FireCrawl API failed: ${response.status}`);
    }

    const result = await response.json();
    const data = result.data || result;

    // FIXED: Clean the content to remove donation messages
    let cleanedContent = data.markdown || data.content || data.text || '';
    
    // Remove Wikipedia donation banners
    cleanedContent = cleanedContent
      .replace(/December \d+:.*?wikipedia.*?nonprofit.*?billionaire\.?/gis, '')
      .replace(/You deserve an explanation.*?\$2\.75.*?knowledge\.?/gis, '')
      .replace(/fundraiser will soon be over.*?given you at least \$2\.75/gis, '')
      .trim();

    console.log('✅ FireCrawl success, content length:', cleanedContent.length);

    return {
      success: true,
      data: {
        url,
        title: data.metadata?.title || data.title || 'No title found',
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
          ogUrl: data.metadata?.ogUrl || url,
        },
        links: data.links || [],
      }
    };
  } catch (error) {
    console.error('❌ FireCrawl Error:', error);
    throw error;
  }
}

// ==============================================
// ENHANCED GEMINI AI - FIXED WITH KEYWORD FOCUS
// ==============================================

export async function analyzeWithGeminiResearch(content: string, keywords: string[], url: string) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key is missing - using fallback analysis');
    return createFallbackAnalysis(content, keywords, url);
  }

  try {
    console.log('🔮 Calling Gemini API for deep research analysis...');
    console.log('🎯 Focusing on keywords:', keywords);

    // FIXED: Make keyword focus much more explicit
    const keywordInstruction = keywords.length > 0
      ? `CRITICAL: Focus your ENTIRE analysis on these specific topics: ${keywords.join(', ')}. 
         Extract and analyze ONLY content related to these keywords. 
         Ignore any donation messages, fundraisers, or unrelated content.
         If the webpage mentions these keywords, provide deep analysis of those sections.`
      : 'Analyze the main content, ignoring any donation messages or banners.';

    const prompt = `You are an expert researcher and analyst. Analyze the following web content.

${keywordInstruction}

URL: ${url}
Content to analyze:
${content.substring(0, 8000)}

IMPORTANT INSTRUCTIONS:
1. SKIP any donation messages, fundraising appeals, or banner content
2. Focus ONLY on the main article/page content
3. ${keywords.length > 0 ? `Pay special attention to: ${keywords.join(', ')}` : 'Focus on the primary topic'}

Please provide your analysis in the following structure:

**SOURCE SUMMARY:**
Provide 2-3 paragraphs explaining what this webpage/content is about. What is the main message or purpose? What information is being conveyed? ${keywords.length > 0 ? `Focus specifically on aspects related to: ${keywords.join(', ')}` : ''}

**VERIFIED ORIGIN / MOMENT OF TRUTH:**
Provide historical context and analysis:
- When did this topic/subject first originate or become relevant?
- What are the key historical milestones or "moments of truth"?
- Include specific dates and events where applicable
- Cite the earliest verifiable mentions or developments
${keywords.length > 0 ? `- Focus specifically on the history of: ${keywords.join(', ')}` : ''}

**LATEST UPDATES & FUTURE FORECAST:**
Analyze current state and future trends:
- What is the current status (as of 2024-2025)?
- What recent developments or changes have occurred?
- What are the emerging trends?
- What predictions can be made about the future direction?
- Include specific data points, statistics, or expert predictions if mentioned
${keywords.length > 0 ? `- Focus predictions on: ${keywords.join(', ')}` : ''}

**KEY INSIGHTS:**
List 5 key bullet points (numbered) that capture the most important takeaways from the content.
${keywords.length > 0 ? `Each insight should relate to: ${keywords.join(', ')}` : ''}

Format your response clearly with these exact section headers.`;

    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
            maxOutputTokens: 2500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', errorText);
      console.warn('⚠️ Falling back to basic analysis');
      return createFallbackAnalysis(content, keywords, url);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiResponse) {
      console.warn('⚠️ Empty Gemini response - using fallback');
      return createFallbackAnalysis(content, keywords, url);
    }

    console.log('✅ Gemini research analysis complete');
    console.log('📝 Gemini response length:', aiResponse.length);

    // Parse the structured response
    const parsed = parseResearchAnalysis(aiResponse, content, keywords);

    return {
      success: true,
      ...parsed
    };
  } catch (error) {
    console.error('❌ Gemini Error:', error);
    console.warn('⚠️ Falling back to basic analysis');
    return createFallbackAnalysis(content, keywords, url);
  }
}

function createFallbackAnalysis(content: string, keywords: string[], url: string) {
  console.log('📋 Creating fallback analysis...');
  
  // Clean content first - remove markdown images, links, and donation messages
  let cleanedContent = content
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/December \d+:.*?wikipedia.*?nonprofit.*?billionaire\.?/gis, '') // Remove donation banners
    .replace(/You deserve an explanation.*?\$2\.75.*?knowledge\.?/gis, '')
    .trim();
  
  // FIXED: Filter content by keywords if provided
  let relevantContent = cleanedContent;
  if (keywords.length > 0) {
    const lines = cleanedContent.split('\n').filter(line => line.trim().length > 50);
    const keywordRegex = new RegExp(keywords.join('|'), 'gi');
    const relevantLines = lines.filter(line => keywordRegex.test(line));
    
    if (relevantLines.length > 0) {
      relevantContent = relevantLines.join('\n\n');
      console.log(`✅ Filtered content to ${relevantLines.length} lines matching keywords`);
    }
  }
  
  // Extract first few paragraphs as summary
  const contentLines = relevantContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 50);
  
  const summary = contentLines.slice(0, 3).join('\n\n') || 'Content extracted from the website.';
  
  // Create basic bullet points from content
  const bulletPoints = contentLines
    .slice(0, 5)
    .map((line, index) => ({
      text: line.substring(0, 150) + (line.length > 150 ? '...' : ''),
      importance: 8 - index
    }));

  const keywordText = keywords.length > 0 ? ` focusing on ${keywords.join(', ')}` : '';

  return {
    success: true,
    sourceSummary: summary || `This webpage provides information${keywordText}. The content has been successfully extracted and is available for analysis.`,
    verifiedOrigin: `This content was scraped from ${new URL(url).hostname}${keywordText}. For detailed historical context and origins, the AI analysis feature provides deeper insights when the Gemini API is available.`,
    futureForcast: `The scraped content${keywordText} represents the current state of the webpage. For future forecasts and trend analysis with AI-powered predictions, ensure the Gemini API key is configured.`,
    keyInsights: bulletPoints.length > 0 ? bulletPoints : [
      { text: 'Content successfully extracted from the website', importance: 8 },
      { text: 'Main content and metadata have been captured', importance: 7 },
      { text: keywords.length > 0 ? `Analysis focused on: ${keywords.join(', ')}` : 'Enable AI analysis for deeper insights', importance: 6 }
    ],
    summary: summary.substring(0, 300) || 'Content extracted from website'
  };
}

function parseResearchAnalysis(text: string, content: string, keywords: string[]) {
  const result = {
    sourceSummary: '',
    verifiedOrigin: '',
    futureForcast: '',
    keyInsights: [] as { text: string; importance: number }[],
    summary: ''
  };

  // Extract Source Summary
  const summaryMatch = text.match(/\*\*SOURCE SUMMARY:?\*\*\s*([\s\S]*?)(?=\*\*VERIFIED ORIGIN|\*\*LATEST UPDATES|$)/i);
  if (summaryMatch) {
    result.sourceSummary = summaryMatch[1].trim();
    result.summary = result.sourceSummary.split('\n\n')[0]; // First paragraph as summary
  }

  // Extract Verified Origin
  const originMatch = text.match(/\*\*VERIFIED ORIGIN[^*]*:?\*\*\s*([\s\S]*?)(?=\*\*LATEST UPDATES|$)/i);
  if (originMatch) {
    result.verifiedOrigin = originMatch[1].trim();
  }

  // Extract Future Forecast
  const forecastMatch = text.match(/\*\*LATEST UPDATES[^*]*:?\*\*\s*([\s\S]*?)(?=\*\*KEY INSIGHTS|$)/i);
  if (forecastMatch) {
    result.futureForcast = forecastMatch[1].trim();
  }

  // Extract Key Insights with cleaning
  const insightsMatch = text.match(/\*\*KEY INSIGHTS:?\*\*\s*([\s\S]*?)$/i);
  if (insightsMatch) {
    const insightsText = insightsMatch[1];
    const bulletPoints = insightsText
      .split('\n')
      .filter(line => line.trim().match(/^[\d\-\*•]/))
      .slice(0, 5)
      .map(point => {
        // Clean up the text
        let cleaned = point.replace(/^[\d\-\*•.\s]+/, '').trim();
        // Remove markdown images: ![alt](url)
        cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
        // Remove markdown links: [text](url)
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        // Remove HTML tags
        cleaned = cleaned.replace(/<[^>]+>/g, '');
        return cleaned.trim();
      })
      .filter(text => text.length > 10); // Only keep substantial insights

    result.keyInsights = bulletPoints.map((text, index) => ({
      text,
      importance: 9 - index
    }));
  }

  // Fallback if parsing failed
  if (!result.sourceSummary || !result.verifiedOrigin || !result.futureForcast) {
    console.warn('⚠️ Parsing incomplete, using fallback for missing sections');
    const fallback = createFallbackAnalysis(content, keywords, '');
    
    if (!result.sourceSummary) result.sourceSummary = fallback.sourceSummary;
    if (!result.verifiedOrigin) result.verifiedOrigin = fallback.verifiedOrigin;
    if (!result.futureForcast) result.futureForcast = fallback.futureForcast;
    if (!result.summary) result.summary = fallback.summary;
    if (result.keyInsights.length === 0) result.keyInsights = fallback.keyInsights;
  }

  return result;
}

// ==============================================
// COMBINED SCRAPE WITH ENHANCED AI RESEARCH
// ==============================================

export async function performScrape(url: string, keywords: string[] = [], useGemini: boolean = true) {
  try {
    console.log('🚀 Starting enhanced scrape with AI research for:', url);
    console.log('📊 Keywords:', keywords);
    console.log('🤖 AI Analysis:', useGemini ? 'Enabled' : 'Disabled');

    // Step 1: Scrape with FireCrawl
    const scrapeResult = await scrapeWithFireCrawl({ url, keywords });

    if (!scrapeResult.success) {
      throw new Error('Failed to scrape website');
    }

    console.log('✅ Scrape successful, content length:', scrapeResult.data.content.length);

    // Step 2: Always perform AI Analysis (it has built-in fallbacks)
    let analysisResult;
    try {
      analysisResult = await analyzeWithGeminiResearch(
        scrapeResult.data.content,
        keywords,
        url
      );
      console.log('✅ Analysis complete');
    } catch (aiError) {
      console.error('❌ Critical AI Analysis Error:', aiError);
      // Ultimate fallback
      analysisResult = createFallbackAnalysis(
        scrapeResult.data.content,
        keywords,
        url
      );
    }

    // Step 3: Combine results with enhanced research data
    const combinedData: ScrapeData = {
      url,
      title: scrapeResult.data.metadata.title || scrapeResult.data.title,
      meta_description: analysisResult.sourceSummary || scrapeResult.data.metadata.description,
      keywords,
      links: scrapeResult.data.links,
      highlighted_content: analysisResult.keyInsights,
      og_data: {
        title: scrapeResult.data.metadata.ogTitle,
        description: scrapeResult.data.metadata.ogDescription,
        image: scrapeResult.data.metadata.ogImage,
        url: scrapeResult.data.metadata.ogUrl,
      },
      raw_content: scrapeResult.data.content,
      ai_summary: analysisResult.summary,
      // Enhanced research fields
      verified_origin: analysisResult.verifiedOrigin,
      future_forecast: analysisResult.futureForcast,
    };

    console.log('✅ Enhanced scrape with AI research completed!');
    console.log('📝 Result has verified_origin:', !!combinedData.verified_origin);
    console.log('📝 Result has future_forecast:', !!combinedData.future_forecast);

    return {
      success: true,
      data: combinedData,
    };
  } catch (error) {
    console.error('❌ Scrape Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ==============================================
// SUPABASE DATABASE OPERATIONS
// ==============================================

export async function saveScrape(scrapeData: ScrapeData) {
  try {
    const { data, error } = await supabase
      .from('scrapes')
      .insert([scrapeData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Save Error:', error);
    throw new Error('Failed to save scrape to database');
  }
}

export async function getAllScrapes() {
  try {
    const { data, error } = await supabase
      .from('scrapes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get Scrapes Error:', error);
    throw new Error('Failed to fetch scrapes from database');
  }
}

export async function getScrapeById(id: string) {
  try {
    const { data, error } = await supabase
      .from('scrapes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get Scrape Error:', error);
    throw new Error('Failed to fetch scrape from database');
  }
}

export async function deleteScrape(id: string) {
  try {
    const { error } = await supabase
      .from('scrapes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    throw new Error('Failed to delete scrape from database');
  }
}