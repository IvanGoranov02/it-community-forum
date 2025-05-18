-- Таблица за докладване на съдържание
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индекси за по-бързо търсене
CREATE INDEX IF NOT EXISTS content_reports_content_idx ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS content_reports_reporter_idx ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status);

-- Таблица за настройки на сайта
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'IT Community Forum',
  site_description TEXT NOT NULL DEFAULT 'A community for IT professionals and enthusiasts',
  allow_registration BOOLEAN NOT NULL DEFAULT true,
  require_email_verification BOOLEAN NOT NULL DEFAULT true,
  allow_guest_viewing BOOLEAN NOT NULL DEFAULT true,
  default_user_role TEXT NOT NULL DEFAULT 'member' CHECK (default_user_role IN ('member', 'moderator', 'admin')),
  post_moderation TEXT NOT NULL DEFAULT 'none' CHECK (post_moderation IN ('pre', 'post', 'none')),
  comment_moderation TEXT NOT NULL DEFAULT 'none' CHECK (comment_moderation IN ('pre', 'post', 'none')),
  max_reports_before_hidden INTEGER NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Вмъкване на начални настройки
INSERT INTO site_settings (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- Функция за обновяване на updated_at при промяна на настройките
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер за обновяване на updated_at
CREATE TRIGGER update_site_settings_timestamp
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_timestamp();

-- Добавяне на колона за скрито съдържание в posts и comments
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Добавяне на колона за брой доклади
ALTER TABLE posts ADD COLUMN IF NOT EXISTS report_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS report_count INTEGER NOT NULL DEFAULT 0;

-- Функция за увеличаване на броя доклади
CREATE OR REPLACE FUNCTION increment_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_type = 'post' THEN
    UPDATE posts SET report_count = report_count + 1 WHERE id = NEW.content_id;
    
    -- Автоматично скриване ако броят доклади надвишава лимита
    UPDATE posts SET is_hidden = true 
    WHERE id = NEW.content_id AND report_count >= (SELECT max_reports_before_hidden FROM site_settings LIMIT 1);
  ELSIF NEW.content_type = 'comment' THEN
    UPDATE comments SET report_count = report_count + 1 WHERE id = NEW.content_id;
    
    -- Автоматично скриване ако броят доклади надвишава лимита
    UPDATE comments SET is_hidden = true 
    WHERE id = NEW.content_id AND report_count >= (SELECT max_reports_before_hidden FROM site_settings LIMIT 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер за увеличаване на броя доклади
CREATE TRIGGER increment_report_count_trigger
AFTER INSERT ON content_reports
FOR EACH ROW
EXECUTE FUNCTION increment_report_count();
