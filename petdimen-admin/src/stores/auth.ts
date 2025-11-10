import { defineStore } from 'pinia'
import { login as apiLogin, type AuthResponse } from '../api/auth'

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// 从 localStorage 恢复登录状态
function restoreAuthState() {
  const token = localStorage.getItem('token')
  const profileStr = localStorage.getItem('profile')
  
  if (!token) return { token: '', profile: null, isAdmin: false }
  
  const payload = decodeJwt(token)
  const roles: string[] = payload?.roles || []
  const isAdmin = roles.includes('ADMIN')
  
  let profile: AuthResponse | null = null
  try {
    profile = profileStr ? JSON.parse(profileStr) : null
  } catch (e) {
    console.error('Failed to parse profile from localStorage', e)
  }
  
  return { token, profile, isAdmin }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const restored = restoreAuthState()
    return {
      token: restored.token,
      profile: restored.profile,
      isAdmin: restored.isAdmin,
    }
  },
  actions: {
    async login(username: string, password: string) {
      const resp = await apiLogin({ username, password })
      this.token = resp.token
      this.profile = resp
      
      // 持久化到 localStorage
      localStorage.setItem('token', resp.token)
      localStorage.setItem('profile', JSON.stringify(resp))
      
      const payload = decodeJwt(resp.token)
      const roles: string[] = payload?.roles || []
      this.isAdmin = roles.includes('ADMIN')
    },
    logout() {
      this.token = ''
      this.profile = null
      this.isAdmin = false
      
      // 清除 localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('profile')
    },
  },
})


