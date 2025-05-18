-- Създаваме таблицата user_settings, ако не съществува
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) NOT NULL DEFAULT 'system',
  language VARCHAR(10) NOT NULL DEFAULT 'bg',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  activity_summary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Добавяме RLS политики
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Политика за четене - потребителите могат да четат само своите настройки
DROP POLICY IF EXISTS "Users can read their own settings" ON user_settings;
CREATE POLICY "Users can read their own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Политика за създаване - потребителите могат да създават само свои настройки
DROP POLICY IF EXISTS "Users can create their own settings" ON user_settings;
CREATE POLICY "Users can create their own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика за обновяване - потребителите могат да обновяват само своите настройки
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Политика за изтриване - потребителите могат да изтриват само своите настройки
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
CREATE POLICY "Users can delete their own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Даваме права на authenticated потребителите
GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO authenticated;
