import React, { createContext, useEffect, useState } from 'react'
import { localStorageService } from '../services/localStorageService'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  continueAsGuest: () => void
  migrateGuestData: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session
    const initializeAuth = () => {
      const currentUser = localStorageService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    
    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const user = await localStorageService.signIn(email, password)
    setUser(user)
  }

  const signUp = async (email: string, password: string) => {
    const user = await localStorageService.signUp(email, password)
    setUser(user)
  }

  const signOut = async () => {
    await localStorageService.signOut()
    setUser(null)
  }

  const continueAsGuest = () => {
    const guestUser = localStorageService.createGuestUser()
    setUser(guestUser)
  }

  const migrateGuestData = async () => {
    if (!user?.isGuest) return

    // This will be called after successful sign up
    // The migration happens automatically in the sign up process
    // since the user data is already associated with the new user ID
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    migrateGuestData
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}