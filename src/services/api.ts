// Add this function to your api.ts file (replace the existing saveScrape function)

import { supabase, ScrapeData } from '../lib/supabase';

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