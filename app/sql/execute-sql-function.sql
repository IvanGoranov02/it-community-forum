-- Функция за изпълнение на SQL заявки
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
