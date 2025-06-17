# IT Community Forum - Архитектурна Документация

## 📋 Съдържание
1. [Преглед на системата](#преглед-на-системата)
2. [C4 Контейнерна диаграма](#c4-контейнерна-диаграма)
3. [Структура на базата данни](#структура-на-базата-данни)
4. [Технически стандарти и практики](#технически-стандарти-и-практики)
5. [Примери от кода](#примери-от-кода)

---

## 🏗️ Преглед на системата

IT Community Forum е модерна уеб платформа, построена с Next.js 15 и React 19, предназначена за IT специалисти, разработчици и технологични ентусиасти. Системата използва Supabase като backend-as-a-service решение.

### Основни функционалности:
- ✅ Потребителска автентикация (Email/Password + OAuth)
- ✅ Създаване и управление на постове
- ✅ Система за коментари с nested replies
- ✅ Гласуване за постове и коментари
- ✅ Bookmarks система
- ✅ Real-time известия
- ✅ Категории и тагове
- ✅ Търсене и филтриране
- ✅ Админ панел
- ✅ Responsive дизайн

---

## 🏛️ C4 Контейнерна диаграма

### Архитектурни компоненти:

#### **Потребителски слой:**
- **Потребител** - IT специалист, разработчик или ентусиаст

#### **Външни системи:**
- **Google OAuth** - OAuth 2.0 автентикация
- **GitHub OAuth** - OAuth 2.0 автентикация
- **Vercel** - Хостинг платформа

#### **Основна система:**

**Next.js Application Layer:**
- Server Components за SSR/SSG
- Client Components за интерактивност
- App Router за routing
- Server Actions за server-side логика

**API Layer:**
- RESTful API Routes (`/api/login`, `/api/posts/[id]`)
- Server Actions (`register()`, `login()`, `createPost()`)

**Supabase Backend:**
- PostgreSQL Database с таблици за профили, постове, коментари
- Supabase Auth за JWT автентикация
- Supabase Storage за файлове
- Supabase Realtime за WebSocket връзки

**Client Library:**
- `createBrowserClient()` за browser components
- `createServerClient()` за server components

### Комуникационни потоци:
1. Потребителят взаимодейства с Next.js приложението чрез HTTPS
2. Next.js извиква API routes и Server Actions
3. Client library комуникира със Supabase услугите
4. OAuth интеграция с Google/GitHub
5. Vercel хоства цялото приложение

---

## 🗄️ Структура на базата данни

### Основни таблици:

#### **profiles** - Потребителски профили
```sql
id          uuid PRIMARY KEY
username    varchar UNIQUE
full_name   varchar
avatar_url  text
bio         text
role        varchar DEFAULT 'member'
reputation  integer DEFAULT 0
```

#### **posts** - Публикации
```sql
id          uuid PRIMARY KEY
title       varchar NOT NULL
slug        varchar UNIQUE
content     text NOT NULL
author_id   uuid REFERENCES profiles(id)
category_id uuid REFERENCES categories(id)
is_pinned   boolean DEFAULT false
views       integer DEFAULT 0
```

#### **categories** - Категории
```sql
id          uuid PRIMARY KEY
name        varchar UNIQUE
slug        varchar UNIQUE
description text
```

#### **comments** - Коментари
```sql
id        uuid PRIMARY KEY
content   text NOT NULL
author_id uuid REFERENCES profiles(id)
post_id   uuid REFERENCES posts(id)
parent_id uuid REFERENCES comments(id)
```

#### **Допълнителни таблици:**
- **tags** - Тагове за постове
- **post_tags** - Many-to-many връзка между постове и тагове
- **post_votes** - Гласуване за постове
- **comment_votes** - Гласуване за коментари
- **bookmarks** - Запазени постове
- **notifications** - Известия към потребители
- **content_reports** - Докладвания за неподходящо съдържание

### Ключови връзки:
- Всеки пост има автор (profiles)
- Всеки пост принадлежи към категория
- Коментарите могат да имат родителски коментари (nested)
- Many-to-many връзка между постове и тагове

---

## 🛡️ Технически стандарти и практики

### 1. **Скорост на зареждане (Performance)**

**Кеширане на API заявки:**
```typescript
// lib/api.ts
export const getPostBySlug = cache(async (slug: string) => {
  const supabase = createServerClient()
  // Кеширана функция за по-бързо зареждане
})
```

**Оптимизации:**
- Next.js `cache()` за server-side кеширане
- Image optimization с Next.js Image компонент
- Code splitting с dynamic imports
- Server Components за намаляване на JavaScript bundle

### 2. **Сигурност (Security)**

**Input validation:**
```typescript
// app/api/login/route.ts
const { email, password } = await request.json()

if (!email || !password) {
  return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
}
```

**Secure cookies:**
```typescript
cookieStore.set("supabase-auth", JSON.stringify(cookieSession), {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
})
```

**Защити:**
- SQL injection защита чрез Supabase ORM
- XSS защита чрез React's built-in sanitization
- CSRF защита чрез SameSite cookies
- Secure HTTP headers

### 3. **Достъпност (Accessibility)**

**Semantic HTML и ARIA:**
```typescript
// components/ui/input.tsx
<input
  className={cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50"
  )}
  ref={ref}
  {...props}
/>
```

**Accessibility features:**
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance
- ARIA labels и descriptions

### 4. **Responsive Design**

**Mobile-first CSS:**
```css
/* app/globals.css */
body {
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  min-height: 100vh;
}

.card {
  border-radius: 1.2rem !important;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.14);
}
```

**Responsive features:**
- Tailwind CSS с responsive utilities
- CSS Grid и Flexbox layouts
- Mobile-optimized navigation
- Touch-friendly UI elements

### 5. **SEO Оптимизация**

**Dynamic Metadata:**
```typescript
// app/post/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  
  return {
    title: `${post.title} | IT-Community Forum`,
    description: post.content.substring(0, 160) + '...',
    openGraph: {
      title: post.title,
      type: 'article',
      publishedTime: post.created_at
    }
  }
}
```

**SEO features:**
- Server-side rendering (SSR)
- Dynamic meta tags
- Structured data (Schema.org)
- Automatic sitemap generation
- Robots.txt configuration
- Canonical URLs

### 6. **Управляемост (Maintainability)**

**Server Actions организация:**
```typescript
// app/actions/auth.ts
"use server"

export async function register(formData: FormData) {
  // Добре структуриран код с ясни функции
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  
  if (!name || !email) {
    return { error: "All fields are required" }
  }
  
  // Логика за регистрация...
}
```

**Best practices:**
- TypeScript за type safety
- Модулна архитектура
- Separation of concerns
- Error handling и logging
- Code splitting и lazy loading

---

## 💻 Примери от кода

### Server Components
```typescript
// app/login/page.tsx
import { getUser } from "@/app/actions/auth"
import { LoginForm } from "@/components/login-form"

// Това е Server Component - рендира се на сървъра
export default async function LoginPage() {
  const user = await getUser()
  
  if (user) {
    redirect('/')
  }
  
  return <LoginForm />
}
```

### Client Components
```typescript
// components/login-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const router = useRouter()
  
  // Интерактивна логика...
}
```

### Server Actions
```typescript
// app/actions/posts.ts
"use server"

export async function createNewPost(formData: FormData) {
  const user = await getUser()
  
  if (!user) {
    return { error: "You must be logged in" }
  }
  
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  
  // Създаване на пост...
}
```

### API Routes
```typescript
// app/api/posts/[id]/route.ts
export async function DELETE(request: NextRequest, { params }) {
  const user = await getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Изтриване на пост...
}
```

### Supabase Integration
```typescript
// lib/supabase.ts
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const createBrowserClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
```

---

## 🚀 Deployment и Production

### Vercel Configuration
- Automatic deployments от GitHub
- Edge functions за по-добра производителност
- Environment variables management
- Custom domains и SSL certificates

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Performance Monitoring
- Vercel Analytics за performance metrics
- Error tracking и logging
- Real-time monitoring на база данни

---

## 📊 Заключение

IT Community Forum демонстрира модерна архитектура за уеб приложения, използвайки най-новите технологии и best practices в областта на уеб разработката. Системата е построена с фокус върху производителност, сигурност, достъпност и SEO оптимизация.

Архитектурата позволява лесно мащабиране и поддръжка, като същевременно осигурява отлично потребителско изживяване на всички устройства и платформи.

---

*Документацията е актуална към декември 2024 г.* 