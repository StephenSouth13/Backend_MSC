"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { getUser, setUser, type StoredUser } from "@/lib/storage"
import { markUserLogout, upsertUserRecord } from "@/lib/users"

export type AuthContextValue = {
  user: StoredUser | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

// Demo users removed - use real authentication via Supabase

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null)

  useEffect(() => {
    setUserState(getUser())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async signIn(email: string, password: string) {
        if (!password || password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự")
        // TODO: Implement real authentication with Supabase
        // This requires backend API endpoint to verify credentials
        throw new Error("Authentication not configured")
      },
      signOut() {
        if (user) markUserLogout(user)
        setUser(null)
        setUserState(null)
      },
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
