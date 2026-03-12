import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = localStorage.getItem('sws_user')
  const token = localStorage.getItem('sws_token')

  return {
    user: stored ? JSON.parse(stored) : null,
    isAuthenticated: !!(stored && token),
    setUser: (user) => set({ user, isAuthenticated: true }),
    clearUser: () => set({ user: null, isAuthenticated: false }),
  }
})
