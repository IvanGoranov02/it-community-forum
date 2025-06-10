-- Function to run SQL queries
CREATE OR REPLACE FUNCTION run_sql(sql_query text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE sql_query;
    RETURN 'SQL executed successfully';
EXCEPTION WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;
