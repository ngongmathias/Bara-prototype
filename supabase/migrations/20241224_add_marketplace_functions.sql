-- Function to increment view count for marketplace listings
CREATE OR REPLACE FUNCTION increment_marketplace_view_count(listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_listings
  SET view_count = view_count + 1
  WHERE id = listing_id;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_marketplace_view_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_marketplace_view_count(uuid) TO anon;
