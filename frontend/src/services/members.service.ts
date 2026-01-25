import api from './api'
import type {
  Member,
  CreateMemberDto,
  UpdateMemberDto,
  QueryMembersDto,
  MembersListResponse,
} from '@/types/member.types'

class MembersService {
  private readonly basePath = '/members'

  async getAll(query?: QueryMembersDto): Promise<MembersListResponse> {
    const response = await api.get<MembersListResponse>(this.basePath, {
      params: query,
    })
    return response.data
  }

  async getById(id: string): Promise<Member> {
    const response = await api.get<Member>(`${this.basePath}/${id}`)
    return response.data
  }

  async create(data: CreateMemberDto): Promise<Member> {
    const response = await api.post<Member>(this.basePath, data)
    return response.data
  }

  async update(id: string, data: UpdateMemberDto): Promise<Member> {
    const response = await api.put<Member>(`${this.basePath}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`${this.basePath}/${id}`)
    return response.data
  }

  async addRoles(id: string, roles: string[]): Promise<{ message: string; roles: string[] }> {
    const response = await api.post<{ message: string; roles: string[] }>(
      `${this.basePath}/${id}/roles/add`,
      { roles }
    )
    return response.data
  }

  async removeRoles(id: string, roles: string[]): Promise<{ message: string; roles: string[] }> {
    const response = await api.post<{ message: string; roles: string[] }>(
      `${this.basePath}/${id}/roles/remove`,
      { roles }
    )
    return response.data
  }

  async uploadPhoto(memberId: string, file: File): Promise<{ photoUrl: string }> {
    console.log('📤 membersService.uploadPhoto called')
    console.log('📤 memberId:', memberId)
    console.log('📤 file:', file)
    console.log('📤 file instanceof File:', file instanceof File)
    console.log('📤 file.name:', file?.name)
    console.log('📤 file.size:', file?.size)
    console.log('📤 file.type:', file?.type)

    const formData = new FormData()
    formData.append('photo', file, file.name)

    // Debug: check what's in FormData
    console.log('📤 FormData entries:')
    for (const pair of formData.entries()) {
      console.log('📤  ', pair[0], pair[1])
    }

    console.log('📤 Sending request to /uploads/members/' + memberId + '/photo')

    // Must explicitly remove Content-Type so axios sets multipart/form-data with boundary
    const response = await api.post<{ photoUrl: string }>(
      `/uploads/members/${memberId}/photo`,
      formData,
      {
        headers: {
          'Content-Type': undefined
        }
      }
    )
    console.log('📤 Response received:', response.data)
    return response.data
  }

  async deletePhoto(memberId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/uploads/members/${memberId}/photo`
    )
    return response.data
  }
}

export const membersService = new MembersService()
