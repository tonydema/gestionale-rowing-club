import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { User, LoginCredentials, RegisterData } from '@/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userRoles = computed(() => user.value?.roles || [])
  const hasRole = (role: string) => userRoles.value.includes(role as any)
  const isAdmin = computed(() => hasRole('ADMIN'))
  const isSegreteria = computed(() => hasRole('SEGRETERIA'))
  const isAllenatore = computed(() => hasRole('ALLENATORE'))
  const isAtleta = computed(() => hasRole('ATLETA'))

  // Actions
  async function login(credentials: LoginCredentials) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.login(credentials)

      user.value = response.user
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken

      // Salva in localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterData) {
    try {
      isLoading.value = true
      error.value = null

      const newUser = await authService.register(data)
      return newUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Pulisci stato
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      error.value = null

      // Pulisci localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async function fetchCurrentUser() {
    try {
      isLoading.value = true
      const currentUser = await authService.getMe()
      user.value = currentUser
      localStorage.setItem('user', JSON.stringify(currentUser))
      return currentUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function initializeFromStorage() {
    const storedUser = localStorage.getItem('user')
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedUser && storedAccessToken && storedRefreshToken) {
      user.value = JSON.parse(storedUser)
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userRoles,
    hasRole,
    isAdmin,
    isSegreteria,
    isAllenatore,
    isAtleta,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    initializeFromStorage,
    clearError,
  }
})
