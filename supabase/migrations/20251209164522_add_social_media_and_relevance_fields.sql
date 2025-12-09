/*
  # Add Social Media and Keyword Relevance Fields

  1. New Columns
    - `keyword_relevance_score` (numeric) - Relevance score from 0-10 for keyword matches
    - `linkedin_post` (text) - Generated LinkedIn post content
    - `twitter_post` (text) - Generated Twitter post content
    - `instagram_caption` (text) - Generated Instagram caption
    - `key_highlights` (jsonb) - Array of 5-10 key bullet points
    - `short_summary` (text) - 150-word summary of the content

  2. Changes
    - Add social media content generation fields
    - Add keyword relevance scoring
    - Add structured key highlights
    
  3. Notes
    - All new fields are optional to maintain backward compatibility
    - Existing scrapes will continue to work without these fields
*/

DO $$ 
BEGIN
  -- Add keyword relevance score field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'keyword_relevance_score'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN keyword_relevance_score numeric(3,1) DEFAULT NULL;
  END IF;

  -- Add LinkedIn post field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'linkedin_post'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN linkedin_post text DEFAULT NULL;
  END IF;

  -- Add Twitter post field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'twitter_post'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN twitter_post text DEFAULT NULL;
  END IF;

  -- Add Instagram caption field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'instagram_caption'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN instagram_caption text DEFAULT NULL;
  END IF;

  -- Add key highlights field (structured bullet points)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'key_highlights'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN key_highlights jsonb DEFAULT NULL;
  END IF;

  -- Add short summary field (150 words)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'short_summary'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN short_summary text DEFAULT NULL;
  END IF;
END $$;