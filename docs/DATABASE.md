# IT Community Forum – База данни и заявки

## Структура на базата данни

### Таблици

#### 1. profiles – Потребителски профили
- `id` (uuid, PK)
- `username` (string)
- `full_name` (string, nullable)
- `avatar_url` (string, nullable)
- `bio` (string, nullable)
- `role` (string, default: 'user')
- `reputation` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `is_banned` (boolean, default: false)

#### 2. categories – Категории за постове
- `id` (uuid, PK)
- `name` (string)
- `slug` (string, unique)
- `description` (string, nullable)
- `icon` (string, nullable)
- `color` (string, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `post_count` (integer, default: 0)
- `user_count` (integer, default: 0)

#### 3. posts – Постове във форума
- `id` (uuid, PK)
- `title` (string)
- `slug` (string, unique)
- `content` (string)
- `author_id` (uuid, FK)
- `category_id` (uuid, FK)
- `is_pinned` (boolean, default: false)
- `views` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `is_archived` (boolean, default: false)
- `is_hidden` (boolean, default: false)

#### 4. comments – Коментари към постове
- `id` (uuid, PK)
- `content` (string)
- `author_id` (uuid, FK)
- `post_id` (uuid, FK)
- `parent_id` (uuid, FK, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `is_hidden` (boolean, default: false)

#### 5. post_votes – Гласове за постове
- `id` (uuid, PK)
- `post_id` (uuid, FK)
- `user_id` (uuid, FK)
- `vote_type` (integer)
- `created_at` (timestamp)

#### 6. comment_votes – Гласове за коментари
- `id` (uuid, PK)
- `comment_id` (uuid, FK)
- `user_id` (uuid, FK)
- `vote_type` (integer)
- `created_at` (timestamp)

#### 7. tags – Тагове за постове
- `id` (uuid, PK)
- `name` (string)
- `slug` (string, unique)
- `description` (string, nullable)
- `created_at` (timestamp)

#### 8. post_tags – Връзка между постове и тагове
- `post_id` (uuid, FK)
- `tag_id` (uuid, FK)
- PK: (post_id, tag_id)

#### 9. bookmarks – Отметки на постове
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `post_id` (uuid, FK)
- `created_at` (timestamp)

#### 10. notifications – Известия за потребители
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `content` (string)
- `link` (string, nullable)
- `is_read` (boolean, default: false)
- `created_at` (timestamp)
- `type` (string, default: 'system')

#### 11. content_reports – Доклади за съдържание
- `id` (uuid, PK)
- `content_type` (string)
- `content_id` (uuid)
- `reporter_id` (uuid, FK)
- `reason` (string)
- `details` (string, nullable)
- `status` (string, default: 'pending')
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 12. site_settings – Настройки на сайта
- `id` (uuid, PK)
- `site_name` (string)
- `site_description` (string)
- `allow_registration` (boolean, default: true)
- `require_email_verification` (boolean, default: true)
- `allow_guest_viewing` (boolean, default: true)
- `default_user_role` (string, default: 'user')
- `post_moderation` (string, default: 'post')
- `comment_moderation` (string, default: 'post')
- `max_reports_before_hidden` (integer, default: 3)
- `updated_at` (timestamp)

#### 13. post_settings – Настройки за постове
- `id` (uuid, PK)
- `min_post_role` (string, default: 'user')
- `min_comment_role` (string, default: 'user')
- `allow_guest_voting` (boolean, default: false)
- `allow_self_voting` (boolean, default: false)
- `min_post_length` (integer, default: 10)
- `max_post_length` (integer, default: 10000)
- `min_comment_length` (integer, default: 5)
- `max_comment_length` (integer, default: 1000)
- `max_tags_per_post` (integer, default: 5)
- `post_moderation` (string, default: 'post')
- `comment_moderation` (string, default: 'post')
- `banned_words` (array of strings, default: [])
- `enable_auto_moderation` (boolean, default: false)
- `updated_at` (timestamp)

#### 14. user_settings – Потребителски настройки
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `theme` (string, default: 'light')
- `email_notifications` (boolean, default: true)
- `show_online_status` (boolean, default: true)
- `language` (string, default: 'bg')
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

### Индекси
- Индекси за бързо търсене по username, slug, author_id, category_id, post_id, user_id и др.
- Комбинирани индекси за гласове, отметки и др.

### Ограничения
- Външни ключове с каскадно изтриване между основните таблици

---

## SQL Функции
- `increment_post_view(post_slug text)` – увеличава броя на преглежданията на пост
- `column_exists(table_name text, column_name text)` – проверява дали колона съществува
- `execute_sql(sql_query text)` – изпълнява SQL заявка
- `update_category_post_counts()` – обновява броя на постовете и уникалните потребители за всички категории
- `create_user_settings(user_id uuid)` – създава настройки за потребител

---

## Преглед на основните заявки и server actions

### Автентикация и потребители
- Регистрация: `app/actions/auth.ts` – `register`
- Вход: `app/actions/auth.ts` – `login`
- Изход: `app/actions/auth.ts` – `logout`
- Текущ потребител: `app/actions/auth.ts` – `getUser`
- Обновяване на профил: `app/actions/profile.ts` – `updateProfile`

### Постове
- Създаване: `app/actions/posts.ts` – `createPostWithTags`
- Обновяване: `app/actions/posts.ts` – `updatePost`
- Изтриване: `app/actions/posts.ts` – `deletePost`
- Архивиране/разархивиране: `app/actions/posts.ts` – `archivePost`, `unarchivePost`
- Гласуване: `app/actions/posts.ts` – `votePost`
- Получаване на постове: `lib/api.ts` – `getRecentPosts`, `getPopularPosts`, `getPostsByCategory`, `getPostBySlug`, `searchPosts`, `getUserPosts`

### Коментари
- Създаване: `app/actions/comments.ts` – `createNewComment`
- Получаване: `lib/api.ts` – `getCommentsByPostId`

### Категории и тагове
- Категории: `lib/api.ts` – `getCategories`, `getCategoryBySlug`
- Тагове: `app/actions/tags.ts` – `getTags`, `getTagBySlug`, `getPostsByTag`, `getPostTags`, `addTagToPost`

### Отметки
- Превключване: `app/actions/bookmarks.ts` – `toggleBookmark`
- Получаване: `app/actions/bookmarks.ts` – `getBookmarkedPosts`, `isPostBookmarked`

### Известия
- Създаване: `app/actions/notifications.ts` – `createNotification`
- Получаване: `app/actions/notifications.ts` – `getUserNotifications`, `getUnreadNotificationsCount`
- Маркиране: `app/actions/notifications.ts` – `markNotificationAsRead`, `markAllNotificationsAsRead`

### Администрация
- Статистика: `app/actions/admin.ts` – `getAdminStats`
- Потребители: `app/actions/admin.ts` – `getUsers`, `updateUserRole`, `toggleUserBan`
- Доклади: `app/actions/admin.ts` – `getReportedContent`, `handleReport`, `reportContent`
- Настройки: `app/actions/admin.ts` – `getSiteSettings`, `updateSiteSettings`, `getPostSettings`, `updatePostSettings`

### Потребителски настройки
- Обновяване: `app/actions/settings.ts` – `updateUserSettings`
- Получаване: `app/actions/settings.ts` – `getUserSettings`

### Специални функции
- Извличане и оцветяване на споменавания: `lib/utils.ts` – `extractMentions`, `highlightMentions`
- Генериране на username и slug: `lib/utils.ts` – `generateUsername`, `slugify`
- Проверка за колона: SQL функция – `column_exists`
- Изпълнение на SQL: SQL функция – `execute_sql`
- Обновяване на броя на постовете: SQL функция – `update_category_post_counts`

---

## Заключение

Базата данни на IT Community Forum е проектирана с множество индекси и ограничения за ефективност и интегритет на данните. Всички заявки са организирани в server actions и API функции, които комуникират с базата чрез Supabase клиент. 