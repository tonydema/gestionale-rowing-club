import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Group, GroupWithMembers, CreateGroupDto, UpdateGroupDto } from '@/types/group.types'
import { groupsService } from '@/services/groups.service'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<GroupWithMembers | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchGroups() {
    loading.value = true
    error.value = null
    try {
      groups.value = await groupsService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nel caricamento dei gruppi'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGroupById(id: string) {
    loading.value = true
    error.value = null
    try {
      currentGroup.value = await groupsService.getById(id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nel caricamento del gruppo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createGroup(data: CreateGroupDto) {
    loading.value = true
    error.value = null
    try {
      const newGroup = await groupsService.create(data)
      groups.value.push(newGroup)
      return newGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nella creazione del gruppo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateGroup(id: string, data: UpdateGroupDto) {
    loading.value = true
    error.value = null
    try {
      const updatedGroup = await groupsService.update(id, data)
      const index = groups.value.findIndex((g) => g.id === id)
      if (index !== -1) {
        groups.value[index] = updatedGroup
      }
      return updatedGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nell'aggiornamento del gruppo"
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteGroup(id: string) {
    loading.value = true
    error.value = null
    try {
      await groupsService.delete(id)
      groups.value = groups.value.filter((g) => g.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nell'eliminazione del gruppo"
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    currentGroup,
    loading,
    error,
    fetchGroups,
    fetchGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
  }
})
