-- Функция за обновяване на броя на постовете в категория
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Ако е добавен нов пост
  IF (TG_OP = 'INSERT') THEN
    UPDATE categories
    SET post_count = post_count + 1
    WHERE id = NEW.category_id;
  -- Ако постът е изтрит
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE categories
    SET post_count = post_count - 1
    WHERE id = OLD.category_id;
  -- Ако постът е обновен и категорията е променена
  ELSIF (TG_OP = 'UPDATE' AND OLD.category_id <> NEW.category_id) THEN
    UPDATE categories
    SET post_count = post_count - 1
    WHERE id = OLD.category_id;
    
    UPDATE categories
    SET post_count = post_count + 1
    WHERE id = NEW.category_id;
  -- Ако постът е архивиран или възстановен
  ELSIF (TG_OP = 'UPDATE' AND OLD.is_archived <> NEW.is_archived) THEN
    IF (NEW.is_archived = true) THEN
      UPDATE categories
      SET post_count = post_count - 1
      WHERE id = NEW.category_id;
    ELSE
      UPDATE categories
      SET post_count = post_count + 1
      WHERE id = NEW.category_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Създаване на тригер за обновяване на броя на постовете
DROP TRIGGER IF EXISTS post_count_trigger ON posts;
CREATE TRIGGER post_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_category_post_count();
