# IT Community Forum

Модерна платформа за общуване и споделяне на знания между IT специалисти.

## 🚀 Функционалности

### Основни
- 👥 Потребителски профили с аватари
- 📝 Създаване и редактиране на постове
- 🏷️ Тагове и категории
- 🔍 Разширено търсене
- 💬 Коментари и реакции
- 📱 Responsive дизайн
- 🌓 Тъмна/светла тема

### Допълнителни
- 🔖 Запазване на постове
- 🔔 Известия в реално време
- 👤 Проследяване на потребители
- 📊 Статистика и активност
- 🛡️ Модерация и репорти

## 🛠️ Технологии

### Frontend
- [Next.js 15](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Headless UI компоненти
- [Shadcn/ui](https://ui.shadcn.com/) - Преизползваеми компоненти
- [React Hook Form](https://react-hook-form.com/) - Форм валидация
- [Zod](https://zod.dev/) - Schema валидация
- [Sonner](https://sonner.emilkowal.ski/) - Toast уведомления

### Backend
- [Supabase](https://supabase.com/) - Backend as a Service
- [PostgreSQL](https://www.postgresql.org/) - Релационна база данни
- [Edge Functions](https://supabase.com/docs/guides/functions) - Serverless функции

### Инфраструктура
- [Vercel](https://vercel.com/) - Хостинг и деплой
- [Cloudflare](https://www.cloudflare.com/) - CDN и защита

## 🏗️ Архитектура

### Frontend
- Server Components за SEO и производителност
- Client Components за интерактивност
- Atomic Design за компоненти
- Оптимизирано зареждане и кеширане

### Backend
- RESTful API endpoints
- Real-time подписки
- Автентикация и авторизация
- File storage и CDN

## 🚀 Стартиране на проекта

### Изисквания
- Node.js 18+
- pnpm
- Supabase акаунт

### Инсталация
```bash
# Клониране на репозиторито
git clone https://github.com/your-username/it-community-forum.git

# Инсталация на зависимости
pnpm install

# Копиране на .env.example в .env.local
cp .env.example .env.local

# Стартиране на development сървъра
pnpm dev
```

### Конфигурация
1. Създайте проект в Supabase
2. Копирайте credentials в `.env.local`
3. Изпълнете SQL миграциите от `sql/` директорията

## 📁 Структура на проекта

```
├── app/                 # Next.js app директория
│   ├── api/            # API routes
│   ├── (auth)/         # Автентикация
│   └── (forum)/        # Форум функционалности
├── components/         # React компоненти
│   ├── ui/            # UI компоненти
│   └── forum/         # Форум компоненти
├── lib/               # Utility функции
├── hooks/             # Custom React hooks
├── types/             # TypeScript типове
└── public/            # Статични файлове
```

## 🧪 Тестване

```bash
# Unit тестове
pnpm test

# E2E тестове
pnpm test:e2e

# Линтинг
pnpm lint
```

## 📝 Документация

- [API Документация](./docs/api.md)
- [Компоненти](./docs/components.md)
- [База данни](./docs/database.md)
- [Деплой](./docs/deployment.md)

## 🤝 Принос

1. Fork проекта
2. Създайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit промените (`git commit -m 'Add amazing feature'`)
4. Push към branch (`git push origin feature/amazing-feature`)
5. Отворете Pull Request

## 📄 Лиценз

Този проект е лицензиран под MIT лиценза - вижте [LICENSE](LICENSE) файла за детайли.

## 👥 Автори

- Вашето име - [GitHub](https://github.com/your-username)

## 🙏 Благодарности

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/)# Trigger deployment
