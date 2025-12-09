/*
  # Create Scrapes Table for Web Scraping Application

  1. New Tables
    - `scrapes`
      - `id` (uuid, primary key) - Unique identifier for each scrape
      - `url` (text) - The scraped website URL
      - `title` (text) - Page title extracted from the website
      - `meta_description` (text) - Meta description from the page
      - `keywords` (text array) - Keywords used for targeted scraping
      - `links` (jsonb) - Array of extracted links from the page
      - `highlighted_content` (jsonb) - Important content/bullet points identified
      - `og_data` (jsonb) - Open Graph metadata (og:title, og:image, etc.)
      - `raw_content` (text) - Raw scraped content for analysis
      - `ai_summary` (text) - AI-generated summary of the content
      - `created_at` (timestamptz) - Timestamp when scrape was created
      - `updated_at` (timestamptz) - Timestamp when scrape was last updated

  2. Security
    - Enable RLS on `scrapes` table
    - Add policy for public read access (for demo purposes)
    - Add policy for public insert access (for demo purposes)
    - Add policy for public delete access (for demo purposes)

  3. Indexes
    - Index on `created_at` for efficient sorting
    - Index on `url` for quick lookups
*/

CREATE TABLE IF NOT EXISTS scrapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  title text,
  meta_description text,
  keywords text[] DEFAULT '{}',
  links jsonb DEFAULT '[]',
  highlighted_content jsonb DEFAULT '[]',
  og_data jsonb DEFAULT '{}',
  raw_content text,
  ai_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE scrapes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, these should be restricted to authenticated users
CREATE POLICY "Anyone can view scrapes"
  ON scrapes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert scrapes"
  ON scrapes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update scrapes"
  ON scrapes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete scrapes"
  ON scrapes
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scrapes_created_at ON scrapes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrapes_url ON scrapes(url);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scrapes_updated_at
  BEFORE UPDATE ON scrapes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();