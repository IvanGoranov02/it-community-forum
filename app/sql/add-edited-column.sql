-- Добавяне на колона is_edited към таблицата posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts'
    AND column_name = 'is_edited'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_edited BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Добавяне на колона is_edited към таблицата comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'comments'
    AND column_name = 'is_edited'
  ) THEN
    ALTER TABLE comments ADD COLUMN is_edited BOOLEAN DEFAULT false;
  END IF;
END $$; 