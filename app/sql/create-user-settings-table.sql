-- Create user_settings table
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

-- Add RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for selecting own settings
CREATE POLICY select_own_settings ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting own settings
CREATE POLICY insert_own_settings ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own settings
CREATE POLICY update_own_settings ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for deleting own settings
CREATE POLICY delete_own_settings ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO authenticated;
