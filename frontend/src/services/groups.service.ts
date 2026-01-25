import type { Group, GroupWithMembers, CreateGroupDto, UpdateGroupDto } from '@/types/group.types'
import apiClient from './api'

export const groupsService = {
  async getAll(): Promise<Group[]> {
    const response = await apiClient.get<Group[]>('/groups')
    return response.data
  },

  async getById(id: string): Promise<GroupWithMembers> {
    const response = await apiClient.get<GroupWithMembers>(`/groups/${id}`)
    return response.data
  },

  async create(data: CreateGroupDto): Promise<Group> {
    const response = await apiClient.post<Group>('/groups', data)
    return response.data
  },

  async update(id: string, data: UpdateGroupDto): Promise<Group> {
    const response = await apiClient.patch<Group>(`/groups/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/groups/${id}`)
  },
}
