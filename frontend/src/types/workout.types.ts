// Types per il modulo Allenamenti (Workout)

export interface Workout {
  id: string
  groupId: string
  notes?: string
  startDateTime: string // ISO date string
  endDateTime: string // ISO date string
  type: WorkoutType
  distance?: number // in metri
  repetitions?: number
  weightDescription?: string
  createdById: string
  createdAt: string
  updatedAt: string
  group: {
    id: string
    name: string
  }
  createdBy: {
    id: string
    username: string
    member?: {
      firstName: string
      lastName: string
    }
  }
}

export enum WorkoutType {
  PESI = 'PESI',
  CORSA = 'CORSA',
  REMERGOMETRO = 'REMERGOMETRO',
  BARCA = 'BARCA',
  BIKE = 'BIKE',
}

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  [WorkoutType.PESI]: 'Pesi',
  [WorkoutType.CORSA]: 'Corsa',
  [WorkoutType.REMERGOMETRO]: 'Remergometro',
  [WorkoutType.BARCA]: 'Barca',
  [WorkoutType.BIKE]: 'Bike',
}

export interface CreateWorkoutDto {
  groupId: string
  notes?: string
  startDateTime: string
  endDateTime: string
  type: WorkoutType
  distance?: number
  repetitions?: number
  weightDescription?: string
  duplicateWeeks?: number
}

export interface UpdateWorkoutDto {
  groupId?: string
  notes?: string
  startDateTime?: string
  endDateTime?: string
  type?: WorkoutType
  distance?: number
  repetitions?: number
  weightDescription?: string
}

export interface WorkoutFilters {
  groupId?: string
  type?: WorkoutType
  startDate?: string
  endDate?: string
}

export interface WorkoutListResponse {
  data: Workout[]
  total: number
  page: number
  limit: number
}
