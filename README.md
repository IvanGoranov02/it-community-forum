# IT Community Forum

A modern, open-source platform for IT professionals, developers, and tech enthusiasts to connect, share knowledge, and grow together.

**Live site:** [https://itforums.org](https://itforums.org)

---

## 🚀 Features

### User Authentication & Profiles
- Email/password registration and login
- OAuth login with Google and GitHub
- Email verification and password reset
- Customizable user profiles with avatars and bio
- Public profile pages and user activity stats

### Content Creation & Discussion
- Create posts with category and tag selection
- Upload and embed images in posts
- Edit and delete your posts
- Rich commenting system with nested replies
- Markdown support and @mentions in comments
- Upvote/downvote posts and comments

### Content Discovery
- Full-text search across posts and comments
- Filter by category, tags, author, and date
- Sort by relevance, date, or popularity
- Browse by categories and tags
- "Recent" and "Popular" post views

### Engagement & Notifications
- Real-time notifications for mentions, replies, and votes
- Email notifications for important activities
- Save/bookmark posts for later
- User dashboard with activity overview

### Moderation & Admin Tools
- Content flagging and reporting
- Post and comment approval workflows
- User roles and permissions (admin, moderator, user)
- Content moderation tools and user management

### Integrations & Extensibility
- Social login (Google, GitHub)
- Share posts to social media
- Code snippet embedding and syntax highlighting
- Public API (planned)

### Responsive & Accessible Design
- Fully responsive for mobile, tablet, and desktop
- Touch-friendly UI and optimized layouts
- Light/dark mode with system preference detection
- Keyboard navigation and ARIA accessibility
- Color contrast compliance
- **Linked Accounts section is fully optimized for mobile**

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth, OAuth
- **Storage:** Supabase Storage
- **Deployment:** Vercel

---

## 🧑‍💻 How It Works

1. **Sign Up & Login:**
   - Register with email or sign in with Google/GitHub.
   - Verify your email for full access.
2. **Create & Discover Content:**
   - Post questions, share knowledge, and join discussions.
   - Use categories and tags for better organization.
   - Search and filter to find relevant topics.
3. **Engage & Connect:**
   - Comment, reply, and mention other users.
   - Upvote/downvote to highlight valuable content.
   - Bookmark posts and manage your activity from your dashboard.
4. **Stay Notified:**
   - Get real-time and email notifications for replies, mentions, and votes.
5. **Moderation:**
   - Report inappropriate content.
   - Admins and moderators manage posts, comments, and users.
6. **Integrations:**
   - Link your Google or GitHub account for easy login.
   - Share posts to social media.
   - Embed code with syntax highlighting.

---

## 🏗️ Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── (auth)/         # Authentication
│   └── (forum)/        # Forum features
├── components/         # React components
│   ├── ui/            # UI components
│   └── forum/         # Forum components
├── lib/               # Utility functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript types
└── public/            # Static files
```

---

## 🏃 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account

### Installation
```bash
# Clone the repository
git clone https://github.com/IvanGoranov02/it-community-forum.git

# Install dependencies
pnpm install

# Copy .env.example to .env.local and fill in your Supabase credentials
cp .env.example .env.local

# Start the development server
pnpm dev
```

### Configuration
1. Create a project in Supabase
2. Copy your Supabase credentials to `.env.local`
3. Run the SQL migrations from the `sql/` directory

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Linting
pnpm lint
```

---

## 👤 Author

**Ivan Goranov**  
Frontend Developer & Student  
[GitHub](https://github.com/IvanGoranov02) | [LinkedIn](https://www.linkedin.com/in/ivan-goranov/)  

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

> IT Community Forum is continuously evolving with new features and improvements based on community feedback and technological advancements.
