# Инструкции за активиране на Realtime нотификации

За да работят правилно нотификациите в реално време, трябва да се активира Realtime функционалността в Supabase.

## 1. Активиране на Realtime в Supabase

1. Отидете в [Supabase Dashboard](https://app.supabase.com/)
2. Изберете вашия проект
3. Отидете в секцията "Database" -> "Replication"
4. Открийте секцията "Realtime" и включете "Source" за таблицата `notifications`
5. Ако таблицата не е в списъка, използвайте следната SQL заявка в SQL Editor:

```sql
-- Активиране на Realtime за notifications таблицата
BEGIN;
  -- Проверка дали supabase_realtime публикацията съществува
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;

  -- Добавяне на notifications таблицата към публикацията
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;
```

## 2. Настройване на RLS политики

Уверете се, че имате правилни Row Level Security (RLS) политики:

```sql
-- Активиране на RLS за таблицата
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Добавяне на политики
-- Потребителите могат да виждат само собствените си нотификации
CREATE POLICY "Notifications are viewable by user" 
ON public.notifications 
FOR SELECT
USING (auth.uid() = user_id);

-- Разрешаваме създаване на нотификации от сървъра
CREATE POLICY "Users can insert notifications" 
ON public.notifications 
FOR INSERT
WITH CHECK (true);

-- Потребителите могат да обновяват само собствените си нотификации
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE
USING (auth.uid() = user_id);
```

## 3. Тестване на нотификациите

1. Отидете на страницата `/test-notifications` в приложението
2. Влезте в профила си
3. Натиснете бутона "Send Test Notification"
4. Проверете дали нотификацията се появява автоматично в списъка с нотификации
5. Ако нотификацията не се появява автоматично, натиснете бутона "Refresh Notifications"

## 4. Отстраняване на проблеми

Ако нотификациите не работят в реално време:

1. Проверете конзолата на браузъра за грешки
2. Уверете се, че Realtime е активиран в Supabase за таблицата `notifications`
3. Проверете RLS политиките дали позволяват достъп до таблицата
4. Проверете дали в .env.local файла са правилно настроени Supabase URL и ANON KEY 