import api from './api'
import type {
  CalendarEvent,
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
} from '@/types/calendar.types'

class CalendarService {
  private readonly basePath = '/calendar'

  async getAll(query?: QueryEventsDto): Promise<CalendarEvent[]> {
    const params: any = {}

    if (query?.types && query.types.length > 0) {
      params.types = query.types
    }
    if (query?.startDate) {
      params.startDate = query.startDate
    }
    if (query?.endDate) {
      params.endDate = query.endDate
    }

    const response = await api.get<CalendarEvent[]>(this.basePath, { params })
    return response.data
  }

  async getById(id: string): Promise<CalendarEvent> {
    const response = await api.get<CalendarEvent>(`${this.basePath}/${id}`)
    return response.data
  }

  async create(data: CreateEventDto): Promise<CalendarEvent> {
    const response = await api.post<CalendarEvent>(this.basePath, data)
    return response.data
  }

  async update(id: string, data: UpdateEventDto): Promise<CalendarEvent> {
    const response = await api.put<CalendarEvent>(`${this.basePath}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`${this.basePath}/${id}`)
    return response.data
  }
}

export const calendarService = new CalendarService()
