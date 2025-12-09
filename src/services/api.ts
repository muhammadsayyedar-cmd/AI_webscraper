import { supabase, ScrapeData } from '../lib/supabase';

export async function performScrape(
  url: string,
  keywords: string[] = [],
  useGemini: boolean = true
): Promise<{ success: boolean; data?: ScrapeData; error?: string }> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-website`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, keywords, useGemini }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Scrape error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scrape website',
    };
  }
}

export async function saveScrapeWithUser(scrapeData: ScrapeData, userId: string) {
  try {
    // Add user_id to the scrape data
    const dataToSave = {
      ...scrapeData,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('scrapes')
      .insert([dataToSave])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Save Error:', error);
    throw new Error('Failed to save scrape to database');
  }
}

// Also update getAllScrapes to filter by user
export async function getUserScrapes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('scrapes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get Scrapes Error:', error);
    throw new Error('Failed to fetch scrapes from database');
  }
}

// Update deleteScrape to ensure user can only delete their own
export async function deleteUserScrape(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from('scrapes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns the scrape

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    throw new Error('Failed to delete scrape from database');
  }
}