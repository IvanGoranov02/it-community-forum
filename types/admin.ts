export type UserRole = "member" | "moderator" | "admin"

export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  newUsersToday: number
  newPostsToday: number
  newCommentsToday: number
  activeUsers: number
}

export interface UserManagementFilters {
  role?: UserRole
  search?: string
  sortBy?: "username" | "created_at" | "reputation"
  sortOrder?: "asc" | "desc"
}

export interface ContentManagementFilters {
  type: "posts" | "comments"
  status?: "all" | "reported" | "hidden"
  search?: string
  category?: string
  sortBy?: "created_at" | "reports" | "views"
  sortOrder?: "asc" | "desc"
}

export interface ReportedContent {
  id: string
  contentType: "post" | "comment"
  contentId: string
  reporterId: string
  reporter: {
    username: string
    avatar_url?: string
  }
  reason: string
  details?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  created_at: string
  updated_at: string
  content?: {
    title?: string
    content: string
    author: {
      username: string
      avatar_url?: string
    }
  }
}

export interface AdminSettings {
  id: string
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  allowGuestViewing: boolean
  defaultUserRole: UserRole
  postModeration: "pre" | "post" | "none"
  commentModeration: "pre" | "post" | "none"
  maxReportsBeforeHidden: number
  updated_at: string
}
