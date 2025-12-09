/*
  # Add Facebook Post Field

  1. New Column
    - `facebook_post` (text) - Generated Facebook post content
  
  2. Notes
    - Optional field to maintain backward compatibility
    - Complements existing social media fields (LinkedIn, Twitter, Instagram)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scrapes' AND column_name = 'facebook_post'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN facebook_post text DEFAULT NULL;
  END IF;
END $$;