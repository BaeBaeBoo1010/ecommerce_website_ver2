-- Run this SQL in Supabase SQL Editor to create the fuzzy search function
-- Optimized for Vietnamese language with typo tolerance

-- 0. Drop existing function (if return type changed)
DROP FUNCTION IF EXISTS search_products_fuzzy(TEXT, INT);

-- 1. Make sure extensions are enabled
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Set lower similarity threshold for better fuzzy matching (default is 0.3)
-- This allows matching with more typos
SELECT set_limit(0.1);

-- 3. Create a helper function to normalize Vietnamese text (remove accents + lowercase)
CREATE OR REPLACE FUNCTION normalize_vietnamese(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(unaccent(COALESCE(input_text, '')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create the search function with fuzzy matching support
CREATE OR REPLACE FUNCTION search_products_fuzzy(search_query TEXT, result_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  description TEXT,
  image_urls TEXT[],
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  similarity_score REAL
) AS $$
DECLARE
  normalized_query TEXT;
BEGIN
  -- Normalize the search query (remove Vietnamese diacritics + lowercase)
  normalized_query := normalize_vietnamese(search_query);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.description,
    p.image_urls,
    c.id AS category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    -- Calculate best similarity score across name, description, article (cast to REAL)
    GREATEST(
      similarity(normalize_vietnamese(p.name), normalized_query),
      similarity(normalize_vietnamese(p.description), normalized_query) * 0.8,
      similarity(normalize_vietnamese(p.article_html), normalized_query) * 0.6
    )::REAL AS similarity_score
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    -- Fuzzy match using pg_trgm % operator (with lowered threshold)
    normalize_vietnamese(p.name) % normalized_query
    OR normalize_vietnamese(p.description) % normalized_query
    OR normalize_vietnamese(p.article_html) % normalized_query
    -- Also include ILIKE for exact substring matches
    OR normalize_vietnamese(p.name) ILIKE '%' || normalized_query || '%'
    OR normalize_vietnamese(p.description) ILIKE '%' || normalized_query || '%'
    OR normalize_vietnamese(p.article_html) ILIKE '%' || normalized_query || '%'
  ORDER BY 
    similarity_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- 5. Test the function with typos
-- SELECT * FROM search_products_fuzzy('cong tac deu khien', 10);
-- SELECT * FROM search_products_fuzzy('cong tac', 10);
