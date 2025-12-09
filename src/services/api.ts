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

export async function analyzeWithGeminiResearch(content: string, keywords: string[], url: string, title?: string) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key is missing - using fallback analysis');
    return createFallbackAnalysis(content, keywords, url, title);
  }

  try {
    console.log('🔮 Calling Gemini API for deep research analysis...');
    console.log('🎯 Focusing on keywords:', keywords);

    // IMPROVED: More strict keyword filtering
    const keywordInstruction = keywords.length > 0
      ? `CRITICAL REQUIREMENT: This analysis MUST focus EXCLUSIVELY on: ${keywords.join(', ')}.

         IMPORTANT RULES:
         1. ONLY extract and analyze content that directly mentions or relates to: ${keywords.join(', ')}
         2. If the webpage does NOT contain content about these keywords, start your response with "NO KEYWORD MATCH:" and explain what the page is actually about
         3. COMPLETELY IGNORE any content not related to: ${keywords.join(', ')}
         4. Skip donation messages, fundraisers, advertisements, and navigation content
         5. Every section of your analysis must relate to the keywords`
      : 'Analyze the main content, ignoring any donation messages or banners.';

    const prompt = `You are a complete web intelligence assistant. Analyze the following web content and provide comprehensive, detailed insights.

${keywordInstruction}

URL: ${url}
Content to analyze:
${content.substring(0, 10000)}

IMPORTANT INSTRUCTIONS:
1. SKIP any donation messages, fundraising appeals, or banner content
2. Focus ONLY on the main article/page content
3. ${keywords.length > 0 ? `Pay special attention to: ${keywords.join(', ')}` : 'Focus on the primary topic'}
4. Provide DETAILED and COMPREHENSIVE information - go deep into the topic
5. Extract specific facts, figures, names, dates, and quotes from the content

Please provide your analysis in the following structure:

**SOURCE SUMMARY:**
Provide 4-5 DETAILED paragraphs (minimum 400 words) explaining what this webpage/content is about. Include:
- The main topic and why it's important
- Key facts, statistics, and data points mentioned
- Important names, organizations, or entities involved
- Specific details and context from the article
- Background information and significance
${keywords.length > 0 ? `Focus specifically on aspects related to: ${keywords.join(', ')}` : ''}
Be thorough and comprehensive - extract ALL important information from the content.

**SHORT SUMMARY:**
Provide a detailed 250-300 word summary that captures the essence of the content. Include key facts, figures, names, dates, and the main points. Make it informative and substantial.

**KEY HIGHLIGHTS:**
List 8-10 DETAILED bullet points that capture the most important takeaways. Each point should be substantial (2-3 sentences) and include:
- Specific facts, numbers, or data
- Names of people, companies, or organizations
- Important context or implications
- Action items or key developments
${keywords.length > 0 ? `Each highlight should relate to: ${keywords.join(', ')}` : ''}
Make each highlight informative and actionable with concrete details.

**VERIFIED ORIGIN / MOMENT OF TRUTH:**
Provide historical context and analysis:
- When did this topic/subject first originate or become relevant?
- What are the key historical milestones or "moments of truth"?
- Include specific dates and events where applicable
${keywords.length > 0 ? `- Focus specifically on the history of: ${keywords.join(', ')}` : ''}

**LATEST UPDATES & FUTURE FORECAST:**
Analyze current state and future trends:
- What is the current status (as of 2024-2025)?
- What recent developments or changes have occurred?
- What are the emerging trends?
- What predictions can be made about the future direction?
${keywords.length > 0 ? `- Focus predictions on: ${keywords.join(', ')}` : ''}

${keywords.length > 0 ? `**KEYWORD RELEVANCE SCORE:**
Rate how relevant this content is to the keywords "${keywords.join(', ')}" on a scale of 0-10.
Format: "Score: X/10"` : ''}

**SOCIAL MEDIA POSTS:**

LinkedIn Post (Professional, engaging, 300-400 characters with key facts):
[Write a professional LinkedIn post with specific details, facts, and a call-to-action]

Twitter/X Post (Concise, under 280 characters, include 2-3 trending hashtags):
[Write an attention-grabbing Twitter post with key stats and hashtags]

Instagram Caption (Engaging storytelling, 150-200 words, include 8-10 relevant hashtags):
[Write an engaging Instagram caption with narrative style and hashtags]

Facebook Post (Conversational, 200-300 words with key details):
[Write a conversational Facebook post that encourages engagement]

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
            maxOutputTokens: 4000,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', errorText);
      console.warn('⚠️ Falling back to basic analysis');
      return createFallbackAnalysis(content, keywords, url, title);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiResponse) {
      console.warn('⚠️ Empty Gemini response - using fallback');
      return createFallbackAnalysis(content, keywords, url, title);
    }

    // Check if Gemini detected no keyword match
    if (aiResponse.startsWith('NO KEYWORD MATCH:')) {
      console.warn('⚠️ Gemini detected no keyword matches - using strict fallback');
      return createFallbackAnalysis(content, keywords, url, title);
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
    return createFallbackAnalysis(content, keywords, url, title);
  }
}

function createFallbackAnalysis(content: string, keywords: string[], url: string, title?: string) {
  console.log('📋 Creating fallback analysis...');
  console.log('📝 Content length:', content.length);
  console.log('🎯 Keywords to match:', keywords);
  console.log('📰 Title:', title);

  // Clean content first - remove markdown images, links, and donation messages
  let cleanedContent = content
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/December \d+:.*?wikipedia.*?nonprofit.*?billionaire\.?/gis, '') // Remove donation banners
    .replace(/You deserve an explanation.*?\$2\.75.*?knowledge\.?/gis, '')
    .trim();

  // IMPROVED: Better keyword filtering - split multi-word phrases and match individual words
  let relevantContent = cleanedContent;
  let keywordMatchCount = 0;
  const searchableText = `${title || ''}\n\n${cleanedContent}`.toLowerCase();

  if (keywords.length > 0) {
    // Split multi-word keywords into individual words for more flexible matching
    const individualKeywords = keywords.flatMap(k =>
      k.split(/\s+/).filter(word => word.length > 2) // Split phrases, ignore tiny words
    );

    console.log('🔍 Searching for individual keywords:', individualKeywords);

    // Check if ANY keyword appears in title or content
    const matchedKeywords = individualKeywords.filter(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );

    console.log('✅ Matched keywords:', matchedKeywords);

    if (matchedKeywords.length === 0) {
      console.warn(`⚠️ No matches found for keywords: ${keywords.join(', ')}`);
      console.log('📄 Content preview:', cleanedContent.substring(0, 500));

      return {
        success: false,
        sourceSummary: `⚠️ No content found matching the keywords: "${keywords.join(', ')}". The scraped page does not contain information about these topics.`,
        verifiedOrigin: `The URL ${url} was successfully scraped, but it does not contain content related to: ${keywords.join(', ')}. Please verify the URL or try different keywords.`,
        futureForcast: `No keyword-relevant content was found to analyze or forecast. Try a different URL that contains information about: ${keywords.join(', ')}.`,
        keyInsights: [
          { text: `No matches found for keywords: ${keywords.join(', ')}`, importance: 10 },
          { text: 'The webpage content does not discuss these topics', importance: 9 },
          { text: 'Try verifying the URL or using different keywords', importance: 8 }
        ],
        summary: `No content matching keywords: ${keywords.join(', ')}`
      };
    }

    console.log(`✅ Found ${matchedKeywords.length} matching keywords out of ${individualKeywords.length}`);

    // Extract relevant paragraphs
    const paragraphs = cleanedContent.split(/\n\n+/).filter(p => p.trim().length > 30);
    const keywordRegex = new RegExp(matchedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');

    const relevantParagraphs: string[] = [];
    paragraphs.forEach((para, index) => {
      const matches = para.match(keywordRegex);
      if (matches) {
        keywordMatchCount += matches.length;
        if (index > 0 && !relevantParagraphs.includes(paragraphs[index - 1])) {
          relevantParagraphs.push(paragraphs[index - 1]);
        }
        relevantParagraphs.push(para);
        if (index < paragraphs.length - 1 && !relevantParagraphs.includes(paragraphs[index + 1])) {
          relevantParagraphs.push(paragraphs[index + 1]);
        }
      }
    });

    if (relevantParagraphs.length > 0) {
      relevantContent = relevantParagraphs.join('\n\n');
      console.log(`✅ Extracted ${relevantParagraphs.length} relevant paragraphs with ${keywordMatchCount} keyword matches`);
    }
  }

  // Extract paragraphs as summary
  const contentParagraphs = relevantContent
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 50);

  const summary = contentParagraphs.slice(0, 2).join('\n\n') || 'Content extracted from the website.';

  // Create bullet points from keyword-relevant content
  const sentences = relevantContent
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 200);

  const bulletPoints = sentences
    .slice(0, 5)
    .map((sentence, index) => ({
      text: sentence,
      importance: 9 - index
    }));

  const keywordText = keywords.length > 0 ? ` about ${keywords.join(', ')}` : '';
  const matchInfo = keywordMatchCount > 0 ? ` (${keywordMatchCount} keyword matches found)` : '';

  return {
    success: true,
    sourceSummary: summary || `This webpage provides information${keywordText}${matchInfo}.`,
    verifiedOrigin: `Content extracted from ${new URL(url).hostname}${keywordText}${matchInfo}. The analysis focused on sections containing the specified keywords.`,
    futureForcast: `The scraped content${keywordText} represents the current state of information on this topic${matchInfo}. For AI-powered predictions and trend analysis, ensure the Gemini API is configured.`,
    keyInsights: bulletPoints.length > 0 ? bulletPoints : [
      { text: 'Content successfully extracted from the website', importance: 8 },
      { text: keywords.length > 0 ? `Focused on: ${keywords.join(', ')}` : 'Main content captured', importance: 7 },
      { text: matchInfo || 'Enable AI analysis for deeper insights', importance: 6 }
    ],
    summary: summary.substring(0, 300) || 'Content extracted from website'
  };
}

function parseResearchAnalysis(text: string, content: string, keywords: string[]) {
  const result: {
    sourceSummary: string;
    verifiedOrigin: string;
    futureForcast: string;
    keyInsights: { text: string; importance: number }[];
    summary: string;
    keyHighlights?: string[];
    shortSummary?: string;
    keywordRelevanceScore?: number;
    linkedinPost?: string;
    twitterPost?: string;
    instagramCaption?: string;
    facebookPost?: string;
  } = {
    sourceSummary: '',
    verifiedOrigin: '',
    futureForcast: '',
    keyInsights: [],
    summary: '',
    keyHighlights: [],
    shortSummary: '',
    keywordRelevanceScore: undefined,
    linkedinPost: '',
    twitterPost: '',
    instagramCaption: '',
    facebookPost: ''
  };

  // Extract Source Summary
  const summaryMatch = text.match(/\*\*SOURCE SUMMARY:?\*\*\s*([\s\S]*?)(?=\*\*SHORT SUMMARY|\*\*KEY HIGHLIGHTS|\*\*VERIFIED ORIGIN|$)/i);
  if (summaryMatch) {
    result.sourceSummary = summaryMatch[1].trim();
    result.summary = result.sourceSummary.split('\n\n')[0];
  }

  // Extract Short Summary (150 words)
  const shortSummaryMatch = text.match(/\*\*SHORT SUMMARY:?\*\*\s*([\s\S]*?)(?=\*\*KEY HIGHLIGHTS|\*\*VERIFIED ORIGIN|$)/i);
  if (shortSummaryMatch) {
    result.shortSummary = shortSummaryMatch[1].trim();
  }

  // Extract Key Highlights (5-10 bullet points)
  const highlightsMatch = text.match(/\*\*KEY HIGHLIGHTS:?\*\*\s*([\s\S]*?)(?=\*\*VERIFIED ORIGIN|\*\*LATEST UPDATES|$)/i);
  if (highlightsMatch) {
    const highlightsText = highlightsMatch[1];
    const bulletPoints = highlightsText
      .split('\n')
      .filter(line => line.trim().match(/^[\d\-\*•]/))
      .slice(0, 10)
      .map(point => {
        let cleaned = point.replace(/^[\d\-\*•.\s]+/, '').trim();
        cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        cleaned = cleaned.replace(/<[^>]+>/g, '');
        return cleaned.trim();
      })
      .filter(text => text.length > 10);

    result.keyHighlights = bulletPoints;
    result.keyInsights = bulletPoints.map((text, index) => ({
      text,
      importance: 10 - index
    }));
  }

  // Extract Verified Origin
  const originMatch = text.match(/\*\*VERIFIED ORIGIN[^*]*:?\*\*\s*([\s\S]*?)(?=\*\*LATEST UPDATES|$)/i);
  if (originMatch) {
    result.verifiedOrigin = originMatch[1].trim();
  }

  // Extract Future Forecast
  const forecastMatch = text.match(/\*\*LATEST UPDATES[^*]*:?\*\*\s*([\s\S]*?)(?=\*\*KEYWORD RELEVANCE|\*\*SOCIAL MEDIA|$)/i);
  if (forecastMatch) {
    result.futureForcast = forecastMatch[1].trim();
  }

  // Extract Keyword Relevance Score
  const scoreMatch = text.match(/\*\*KEYWORD RELEVANCE SCORE:?\*\*\s*[\s\S]*?Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  if (scoreMatch) {
    result.keywordRelevanceScore = parseFloat(scoreMatch[1]);
  }

  // Extract Social Media Posts
  const socialMediaMatch = text.match(/\*\*SOCIAL MEDIA POSTS:?\*\*/i);
  if (socialMediaMatch) {
    // Extract LinkedIn Post
    const linkedinMatch = text.match(/LinkedIn Post[^:]*:\s*([\s\S]*?)(?=Twitter|Instagram|Facebook|$)/i);
    if (linkedinMatch) {
      result.linkedinPost = linkedinMatch[1]
        .replace(/\[Write[^\]]*\]/gi, '')
        .trim();
    }

    // Extract Twitter Post
    const twitterMatch = text.match(/Twitter[^\n]*Post[^:]*:\s*([\s\S]*?)(?=Instagram|Facebook|$)/i);
    if (twitterMatch) {
      result.twitterPost = twitterMatch[1]
        .replace(/\[Write[^\]]*\]/gi, '')
        .trim();
    }

    // Extract Instagram Caption
    const instagramMatch = text.match(/Instagram Caption[^:]*:\s*([\s\S]*?)(?=Facebook|$)/i);
    if (instagramMatch) {
      result.instagramCaption = instagramMatch[1]
        .replace(/\[Write[^\]]*\]/gi, '')
        .trim();
    }

    // Extract Facebook Post
    const facebookMatch = text.match(/Facebook Post[^:]*:\s*([\s\S]*?)(?=\*\*|$)/i);
    if (facebookMatch) {
      result.facebookPost = facebookMatch[1]
        .replace(/\[Write[^\]]*\]/gi, '')
        .trim();
    }
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

    // Call the Supabase Edge Function instead of direct API calls
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('You must be logged in to use the scraper');
    }

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-website`;

    console.log('🌐 Calling edge function:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        keywords,
        useGemini
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge function error:', errorText);
      throw new Error(`Scraping failed: ${response.status} - ${errorText}`);
    }

    const scrapeResult = await response.json();

    if (!scrapeResult.success) {
      throw new Error(scrapeResult.error || 'Failed to scrape website');
    }

    console.log('✅ Edge function completed successfully');
    console.log('📝 Result data:', scrapeResult.data);

    // Perform additional AI analysis if we have Gemini API key
    if (useGemini && scrapeResult.data.raw_content) {
      console.log('🔮 Performing additional AI analysis...');

      try {
        const pageTitle = scrapeResult.data.title;
        const analysisResult = await analyzeWithGeminiResearch(
          scrapeResult.data.raw_content,
          keywords,
          url,
          pageTitle
        );

        // Enhance the result with detailed AI analysis
        scrapeResult.data = {
          ...scrapeResult.data,
          meta_description: analysisResult.sourceSummary || scrapeResult.data.meta_description,
          verified_origin: analysisResult.verifiedOrigin,
          future_forecast: analysisResult.futureForcast,
          keyword_relevance_score: analysisResult.keywordRelevanceScore,
          linkedin_post: analysisResult.linkedinPost,
          twitter_post: analysisResult.twitterPost,
          instagram_caption: analysisResult.instagramCaption,
          facebook_post: analysisResult.facebookPost,
          key_highlights: analysisResult.keyHighlights,
          short_summary: analysisResult.shortSummary,
          highlighted_content: analysisResult.keyInsights,
        };

        console.log('✅ AI analysis complete and merged');
      } catch (aiError) {
        console.warn('⚠️ AI analysis failed, using edge function results:', aiError);
        // Continue with edge function results
      }
    }

    return {
      success: true,
      data: scrapeResult.data as ScrapeData,
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