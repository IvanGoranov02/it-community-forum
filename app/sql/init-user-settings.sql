-- Създаваме функцията за set_updated_at, ако не съществува
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Създаваме функция за инициализация на таблицата user_settings
CREATE OR REPLACE FUNCTION init_user_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Проверяваме дали таблицата съществува
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'user_settings'
  ) THEN
    -- Създаваме таблицата
    CREATE TABLE public.user_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      theme VARCHAR(20) NOT NULL DEFAULT 'system',
      language VARCHAR(10) NOT NULL DEFAULT 'bg',
      emailNotifications BOOLEAN NOT NULL DEFAULT true,
      marketingEmails BOOLEAN NOT NULL DEFAULT false,
      activitySummary BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Добавяме RLS политики
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

    -- Политика за четене - потребителите могат да четат само своите настройки
    CREATE POLICY "Users can read their own settings"
      ON public.user_settings
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Политика за създаване - потребителите могат да създават само свои настройки
    CREATE POLICY "Users can create their own settings"
      ON public.user_settings
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Политика за обновяване - потребителите могат да обновяват само своите настройки
    CREATE POLICY "Users can update their own settings"
      ON public.user_settings
      FOR UPDATE
      USING (auth.uid() = user_id);

    -- Политика за изтриване - потребителите могат да изтриват само своите настройки
    CREATE POLICY "Users can delete their own settings"
      ON public.user_settings
      FOR DELETE
      USING (auth.uid() = user_id);

    -- Добавяме индекс за по-бързо търсене по user_id
    CREATE INDEX user_settings_user_id_idx ON public.user_settings(user_id);

    -- Добавяме тригер за автоматично обновяване на updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.user_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Изпълняваме функцията за инициализация
SELECT init_user_settings();
