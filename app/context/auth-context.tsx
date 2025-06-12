"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase"

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
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isLoading: true,
  refreshUser: async () => {} 
})

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User }) {
  const [user, setUser] = useState<User>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const supabase = createBrowserClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        return {
          id: userId,
          name: profile.full_name || profile.username,
          username: profile.username,
          avatar: profile.avatar_url,
          role: profile.role,
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  // Function to refresh user state
  const refreshUser = async () => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log("Found active session for user:", session.user.id)
        const userProfile = await fetchUserProfile(session.user.id)
        
        if (userProfile) {
          setUser({
            ...userProfile,
            email: session.user.email,
          })
          console.log("User profile loaded:", userProfile.username)
        } else {
          console.warn("Session exists but no profile found")
          setUser(null)
        }
      } else {
        console.log("No active session found")
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Check for auth state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supabase = createBrowserClient()
      
      console.log("Setting up auth state change listener")
      
      // Initial check
      refreshUser()
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id)
          
          if (event === 'SIGNED_IN' && session?.user) {
            const userProfile = await fetchUserProfile(session.user.id)
            if (userProfile) {
              setUser({
                ...userProfile,
                email: session.user.email,
              })
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          }
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
