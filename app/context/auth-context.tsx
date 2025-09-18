"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type User = {
  id: string
  email?: string
  name: string
  username?: string
  avatar?: string
  role?: string
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true })

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User }) {
  const [user, setUser] = useState<User>(initialUser)
  // Always false since we handle auth loading in LoginPageClient
  const [isLoading, setIsLoading] = useState(false)

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
