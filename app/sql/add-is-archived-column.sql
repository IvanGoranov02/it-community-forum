-- Проверка дали колоната is_archived съществува
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'is_archived'
  ) THEN
    -- Добавяне на колоната is_archived
    ALTER TABLE posts ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
