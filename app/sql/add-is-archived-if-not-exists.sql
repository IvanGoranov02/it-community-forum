DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts'
    AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_archived BOOLEAN DEFAULT false;
  END IF;
END $$;
