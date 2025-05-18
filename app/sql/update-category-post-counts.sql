CREATE OR REPLACE FUNCTION update_category_post_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE categories c
  SET post_count = (
    SELECT COUNT(*)
    FROM posts p
    WHERE p.category_id = c.id
    AND (p.is_archived = false OR p.is_archived IS NULL)
  );
END;
$$;
