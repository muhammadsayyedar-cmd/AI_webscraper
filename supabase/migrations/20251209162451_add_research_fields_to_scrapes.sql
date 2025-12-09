/*
  # Add AI Research Fields to Scrapes Table

  1. Changes
    - Add `verified_origin` column to store historical context and origin analysis
    - Add `future_forecast` column to store future trends and predictions
  
  2. Details
    - Both fields are text columns that can be null
    - These fields store AI-generated research analysis
    - `verified_origin` contains historical context, dates, and origin information
    - `future_forecast` contains current status, trends, and future predictions
*/

-- Add verified_origin column for historical analysis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'verified_origin'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN verified_origin text;
  END IF;
END $$;

-- Add future_forecast column for trend analysis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'future_forecast'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN future_forecast text;
  END IF;
END $$;