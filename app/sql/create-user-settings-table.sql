-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  activity_summary BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'bg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_settings_updated_at_trigger ON user_settings;
CREATE TRIGGER update_user_settings_updated_at_trigger
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_user_settings_updated_at();

-- Create RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for selecting own settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting own settings
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own settings
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);
