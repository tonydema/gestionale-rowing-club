import api from './api'
import type {
  Workout,
  CreateWorkoutDto,
  UpdateWorkoutDto,
  WorkoutFilters,
  WorkoutListResponse,
} from '@/types/workout.types'

export const workoutService = {
  async getWorkouts(params?: {
    page?: number
    limit?: number
    filters?: WorkoutFilters
  }): Promise<WorkoutListResponse> {
    const queryParams = {
      page: params?.page,
      limit: params?.limit,
      ...params?.filters,
    }
    const response = await api.get('/workouts', { params: queryParams })
    return response.data
  },

  async getWorkoutById(id: string): Promise<Workout> {
    const response = await api.get(`/workouts/${id}`)
    return response.data
  },

  async createWorkout(data: CreateWorkoutDto): Promise<Workout> {
    const response = await api.post('/workouts', data)
    return response.data
  },

  async updateWorkout(id: string, data: UpdateWorkoutDto): Promise<Workout> {
    const response = await api.put(`/workouts/${id}`, data)
    return response.data
  },

  async deleteWorkout(id: string): Promise<void> {
    await api.delete(`/workouts/${id}`)
  },
}
