"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type User = {
  email: string
  name: string
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true })

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User }) {
  const [user, setUser] = useState<User>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
