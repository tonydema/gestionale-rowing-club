import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { membersService } from '@/services/members.service'
import type {
  Member,
  CreateMemberDto,
  UpdateMemberDto,
  QueryMembersDto,
  AgeCategory,
} from '@/types/member.types'

export const useMembersStore = defineStore('members', () => {
  // State
  const members = ref<Member[]>([])
  const currentMember = ref<Member | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const totalPages = ref(0)

  // Filters
  const searchQuery = ref('')
  const isActiveFilter = ref<boolean | null>(null)
  const categoryFilter = ref<AgeCategory | null>(null)

  // Getters
  const hasMembers = computed(() => members.value.length > 0)
  const paginationInfo = computed(() => ({
    page: currentPage.value,
    limit: itemsPerPage.value,
    total: totalItems.value,
    totalPages: totalPages.value,
  }))

  // Actions
  async function fetchMembers(query?: QueryMembersDto) {
    try {
      isLoading.value = true
      error.value = null

      const params: QueryMembersDto = {
        page: query?.page || currentPage.value,
        limit: query?.limit || itemsPerPage.value,
        search: query?.search || searchQuery.value || undefined,
        isActive: query?.isActive !== undefined ? query.isActive : isActiveFilter.value !== null ? isActiveFilter.value : undefined,
        category: query?.category || categoryFilter.value || undefined,
      }

      const response = await membersService.getAll(params)

      members.value = response.data
      currentPage.value = response.meta.page
      itemsPerPage.value = response.meta.limit
      totalItems.value = response.meta.total
      totalPages.value = response.meta.totalPages

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch members'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMemberById(id: string) {
    try {
      isLoading.value = true
      error.value = null

      const member = await membersService.getById(id)
      currentMember.value = member

      return member
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch member'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createMember(data: CreateMemberDto) {
    try {
      isLoading.value = true
      error.value = null

      const newMember = await membersService.create(data)

      // Refresh list after creation
      await fetchMembers()

      return newMember
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create member'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateMember(id: string, data: UpdateMemberDto) {
    try {
      isLoading.value = true
      error.value = null

      const updatedMember = await membersService.update(id, data)

      // Update in list if present
      const index = members.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        members.value[index] = updatedMember
      }

      // Update current member if it's the same
      if (currentMember.value?.id === id) {
        currentMember.value = updatedMember
      }

      return updatedMember
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update member'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteMember(id: string) {
    try {
      isLoading.value = true
      error.value = null

      await membersService.delete(id)

      // Refresh list after deletion
      await fetchMembers()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete member'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addRolesToMember(id: string, roles: string[]) {
    try {
      isLoading.value = true
      error.value = null

      const result = await membersService.addRoles(id, roles)

      // Refresh member data
      await fetchMemberById(id)

      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add roles'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeRolesFromMember(id: string, roles: string[]) {
    try {
      isLoading.value = true
      error.value = null

      const result = await membersService.removeRoles(id, roles)

      // Refresh member data
      await fetchMemberById(id)

      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove roles'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function setPage(page: number) {
    currentPage.value = page
    fetchMembers()
  }

  function setItemsPerPage(limit: number) {
    itemsPerPage.value = limit
    currentPage.value = 1 // Reset to first page
    fetchMembers()
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page
    fetchMembers()
  }

  function setIsActiveFilter(isActive: boolean | null) {
    isActiveFilter.value = isActive
    currentPage.value = 1 // Reset to first page
    fetchMembers()
  }

  function setCategoryFilter(category: AgeCategory | null) {
    categoryFilter.value = category
    currentPage.value = 1 // Reset to first page
    fetchMembers()
  }

  function clearFilters() {
    searchQuery.value = ''
    isActiveFilter.value = null
    categoryFilter.value = null
    currentPage.value = 1
    fetchMembers()
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentMember() {
    currentMember.value = null
  }

  return {
    // State
    members,
    currentMember,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    searchQuery,
    isActiveFilter,
    categoryFilter,
    // Getters
    hasMembers,
    paginationInfo,
    // Actions
    fetchMembers,
    fetchMemberById,
    createMember,
    updateMember,
    deleteMember,
    addRolesToMember,
    removeRolesFromMember,
    setPage,
    setItemsPerPage,
    setSearchQuery,
    setIsActiveFilter,
    setCategoryFilter,
    clearFilters,
    clearError,
    clearCurrentMember,
  }
})
