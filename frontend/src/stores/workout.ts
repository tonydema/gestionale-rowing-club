import { defineStore } from 'pinia'
import { ref } from 'vue'
import { workoutService } from '@/services/workout.service'
import type { Workout, CreateWorkoutDto, UpdateWorkoutDto, WorkoutFilters } from '@/types/workout.types'

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(100)

  async function fetchWorkouts(params?: {
    page?: number
    limit?: number
    filters?: WorkoutFilters
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await workoutService.getWorkouts(params)
      workouts.value = response.data
      total.value = response.total
      currentPage.value = response.page
      itemsPerPage.value = response.limit
      return response
    } catch (err: any) {
      error.value = err.message || 'Errore nel caricamento degli allenamenti'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getWorkoutById(id: string) {
    loading.value = true
    error.value = null
    try {
      return await workoutService.getWorkoutById(id)
    } catch (err: any) {
      error.value = err.message || 'Errore nel caricamento dell\'allenamento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createWorkout(data: CreateWorkoutDto) {
    loading.value = true
    error.value = null
    try {
      const newWorkout = await workoutService.createWorkout(data)
      workouts.value.push(newWorkout)
      return newWorkout
    } catch (err: any) {
      error.value = err.message || 'Errore nella creazione dell\'allenamento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateWorkout(id: string, data: UpdateWorkoutDto) {
    loading.value = true
    error.value = null
    try {
      const updated = await workoutService.updateWorkout(id, data)
      const index = workouts.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        workouts.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Errore nell\'aggiornamento dell\'allenamento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteWorkout(id: string) {
    loading.value = true
    error.value = null
    try {
      await workoutService.deleteWorkout(id)
      workouts.value = workouts.value.filter((w) => w.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Errore nell\'eliminazione dell\'allenamento'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    workouts,
    loading,
    error,
    total,
    currentPage,
    itemsPerPage,
    fetchWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    clearError,
  }
})
