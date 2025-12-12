-- Run this SQL in Supabase SQL Editor to create the fuzzy search function
-- Optimized for Vietnamese language with typo tolerance and performance

-- ============================================
-- STEP 1: SETUP EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Set lower similarity threshold for better fuzzy matching (default is 0.3)
SELECT set_limit(0.1);

-- ============================================
-- STEP 2: CREATE HELPER FUNCTION
-- ============================================
-- Drop and recreate to ensure it's up to date
DROP FUNCTION IF EXISTS normalize_vietnamese(TEXT);

CREATE OR REPLACE FUNCTION normalize_vietnamese(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(unaccent(COALESCE(input_text, '')));
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- ============================================
-- STEP 3: ADD NORMALIZED COLUMNS FOR PERFORMANCE
-- ============================================
-- Add columns to store pre-normalized text (faster searches)
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_normalized TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_normalized TEXT;

-- Update existing products with normalized values
UPDATE products SET 
  name_normalized = normalize_vietnamese(name),
  description_normalized = normalize_vietnamese(description);

-- ============================================
-- STEP 4: CREATE TRIGGER TO AUTO-UPDATE NORMALIZED COLUMNS
-- ============================================
CREATE OR REPLACE FUNCTION update_normalized_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_normalized := normalize_vietnamese(NEW.name);
  NEW.description_normalized := normalize_vietnamese(NEW.description);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_normalized ON products;
CREATE TRIGGER trg_update_normalized
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_normalized_columns();

-- ============================================
-- STEP 5: CREATE GIN INDEXES FOR FAST SEARCH
-- ============================================
-- These indexes dramatically speed up pg_trgm searches
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
  ON products USING gin (name_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_desc_trgm 
  ON products USING gin (description_normalized gin_trgm_ops);

-- ============================================
-- STEP 6: CREATE OPTIMIZED SEARCH FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS search_products_fuzzy(TEXT, INT);

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
  -- Normalize the search query
  normalized_query := normalize_vietnamese(search_query);
  
  -- Return empty if query is too short
  IF LENGTH(normalized_query) < 2 THEN
    RETURN;
  END IF;
  
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
    -- Use pre-normalized columns for faster similarity calculation
    GREATEST(
      similarity(p.name_normalized, normalized_query),
      similarity(p.description_normalized, normalized_query) * 0.8
    )::REAL AS similarity_score
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    -- Use indexed normalized columns (MUCH faster)
    p.name_normalized % normalized_query
    OR p.description_normalized % normalized_query
    OR p.name_normalized ILIKE '%' || normalized_query || '%'
    OR p.description_normalized ILIKE '%' || normalized_query || '%'
    -- Also search in article_html (not indexed, slower but complete)
    OR normalize_vietnamese(p.article_html) ILIKE '%' || normalized_query || '%'
  ORDER BY 
    similarity_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 7: TEST THE FUNCTION
-- ============================================
-- SELECT * FROM search_products_fuzzy('cong tac', 10);
-- SELECT * FROM search_products_fuzzy('cong tac deu khien', 10);
