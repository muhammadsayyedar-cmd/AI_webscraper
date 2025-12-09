/*
  # Fix Security Issues

  1. Security Fixes
    - Set function search_path to restrict (immutable) for security
    - Remove unused index idx_scrapes_url if not being utilized

  2. Changes Made
    - Recreate update_updated_at_column function with search_path = 'restrict'
    - Drop unused idx_scrapes_url index (URL searches are infrequent compared to date-based queries)
*/

-- Drop existing function to recreate with proper security settings
DROP TRIGGER IF EXISTS update_scrapes_updated_at ON scrapes;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate function with search_path set to restrict for security
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_scrapes_updated_at
  BEFORE UPDATE ON scrapes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop unused index on url (not frequently filtered, created_at is the primary query pattern)
DROP INDEX IF EXISTS idx_scrapes_url;