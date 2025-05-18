# IT Community Forum

## Описание

IT Community Forum е модерен форум за IT общността, изграден с Next.js и Supabase. Проектът предоставя възможност за създаване на постове, коментари, гласуване, отбелязване на постове, известия, администриране и модерация.

## Основни функционалности
- Регистрация, вход и изход на потребители
- Създаване, редакция, изтриване и архивиране на постове
- Коментари и отговори към постове
- Категории и тагове за организиране на съдържание
- Гласуване за постове и коментари
- Отметки (bookmarks) на постове
- Известия за действия и споменавания
- Администраторски и модераторски панели
- Потребителски настройки (тема, език, известия)

## Технологии
- **Next.js** (App Router, Server Actions)
- **Supabase** (PostgreSQL база данни, Auth)
- **Tailwind CSS** (UI стилизиране)
- **Lucide Icons** (икони)
- **Redux** (глобално състояние)

## Структура на проекта
- `app/` – страници, server actions, API endpoints
- `components/` – UI компоненти
- `lib/` – помощни функции и API обвивки
- `src/actions/` – server actions за бизнес логика
- `src/utilities/` – помощни функции
- `src/screens/` – страници/екрани
- `src/assets/` – икони, изображения

## Основни UI компоненти
- `UserMenu` – меню за потребителски действия
- `LoginForm`, `RegisterForm`, `ProfileEditForm` – форми за автентикация и профил
- `ForumPost`, `Comment`, `PostList`, `CategoryList`, `TagList` – основни елементи на форума
- `LoadingOverlay` – глобален loading индикатор
- `NotificationList` – известия

## State Management
- Глобално състояние с Redux (slice pattern)
- Локално състояние с useState/useReducer за компонент-специфични данни
- Следване на съществуващите Redux action/reducer патерни

## API Интеграция
- Използва се httpClient utility за всички API заявки
- Всички server actions и API endpoints са в `app/actions/` и `lib/api.ts`
- Обработка на loading/error състояния по единен начин

## Тестване
- Тестване на нови функционалности преди commit
- Проверка на responsive дизайн и достъпност
- Проверка на интеграция с API

## Достъпност
- Навигация с клавиатура
- Семантични HTML елементи
- Контраст и alt текст за изображения

## Документация за базата данни и заявки
Виж файла [`docs/DATABASE.md`](docs/DATABASE.md) за пълна информация за структурата на базата, SQL функции и заявки.

## Заключение

IT Community Forum е цялостна платформа за дискусии, съобразена с нуждите на IT общността. Проектът е структуриран за лесна поддръжка, разширяемост и висока достъпност.


[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ivangs-projects-e4e46ce0/v0-it-community-forum)


## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/ivangs-projects-e4e46ce0/v0-it-community-forum](https://vercel.com/ivangs-projects-e4e46ce0/v0-it-community-forum)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/3kS4ntUiL9r](https://v0.dev/chat/projects/3kS4ntUiL9r)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository