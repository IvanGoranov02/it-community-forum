-- Функция за проверка дали колона съществува в таблица
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
  );
END;
$$;
