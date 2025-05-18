-- Функция за задаване на първия администраторски потребител
CREATE OR REPLACE FUNCTION set_first_admin()
RETURNS VOID AS $$
DECLARE
  admin_email TEXT := 'ivangoranoff@gmail.com';
  admin_id UUID;
BEGIN
  -- Проверка дали потребителят съществува
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Администраторският потребител с имейл % не съществува', admin_email;
    RETURN;
  END IF;
  
  -- Задаване на роля "admin" на потребителя
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = admin_id;
  
  RAISE NOTICE 'Потребителят % е зададен като администратор', admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Изпълнение на функцията
SELECT set_first_admin();
