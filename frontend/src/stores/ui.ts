import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SnackbarOptions {
  message: string
  color?: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

export const useUiStore = defineStore('ui', () => {
  // Snackbar state
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref<'success' | 'error' | 'warning' | 'info'>('info')
  const snackbarTimeout = ref(3000)

  // Sidebar state
  const drawer = ref(true)

  // Actions
  function showSnackbar(options: SnackbarOptions) {
    snackbarMessage.value = options.message
    snackbarColor.value = options.color || 'info'
    snackbarTimeout.value = options.timeout || 3000
    snackbar.value = true
  }

  function showSuccess(message: string) {
    showSnackbar({ message, color: 'success' })
  }

  function showError(message: string) {
    showSnackbar({ message, color: 'error', timeout: 5000 })
  }

  function showWarning(message: string) {
    showSnackbar({ message, color: 'warning' })
  }

  function showInfo(message: string) {
    showSnackbar({ message, color: 'info' })
  }

  function closeSnackbar() {
    snackbar.value = false
  }

  function toggleDrawer() {
    drawer.value = !drawer.value
  }

  return {
    // State
    snackbar,
    snackbarMessage,
    snackbarColor,
    snackbarTimeout,
    drawer,
    // Actions
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar,
    toggleDrawer,
  }
})
