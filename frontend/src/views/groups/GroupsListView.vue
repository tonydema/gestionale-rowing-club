<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Gruppi</span>
            <v-btn
              v-if="authStore.isAdmin || authStore.isSegreteria"
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              Nuovo Gruppo
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="groupsStore.groups"
              :loading="groupsStore.loading"
              class="elevation-1"
            >
              <template #[`item.createdAt`]="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <template #[`item._count.members`]="{ item }">
                {{ item._count?.members || 0 }}
              </template>

              <template #[`item.actions`]="{ item }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewGroup(item)"
                />
                <v-btn
                  v-if="authStore.isAdmin || authStore.isSegreteria"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="editGroup(item)"
                />
                <v-btn
                  v-if="authStore.isAdmin || authStore.isSegreteria"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogOpen" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditMode ? 'Modifica Gruppo' : 'Nuovo Gruppo' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveGroup">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Nome Gruppo *"
                  :rules="[(v) => !!v || 'Campo obbligatorio']"
                  variant="outlined"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Annulla</v-btn>
          <v-btn color="primary" variant="flat" @click="saveGroup">Salva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialogOpen" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Dettagli Gruppo</span>
          <v-btn
            v-if="authStore.isAdmin || authStore.isSegreteria"
            color="primary"
            variant="text"
            @click="editFromView"
          >
            Modifica
          </v-btn>
        </v-card-title>

        <v-card-text v-if="groupsStore.currentGroup">
          <v-row>
            <v-col cols="12">
              <h3>Informazioni Gruppo</h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="groupsStore.currentGroup.name"
                label="Nome Gruppo"
                readonly
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="formatDate(groupsStore.currentGroup.createdAt)"
                label="Data Creazione"
                readonly
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <h3>Atleti del Gruppo ({{ groupsStore.currentGroup.members.length }})</h3>
            </v-col>

            <v-col cols="12">
              <v-data-table
                :headers="membersHeaders"
                :items="groupsStore.currentGroup.members"
                :items-per-page="10"
                class="elevation-1"
              >
                <template #[`item.fullName`]="{ item }">
                  {{ item.lastName }} {{ item.firstName }}
                </template>

                <template #[`item.isActive`]="{ item }">
                  <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
                    {{ item.isActive ? 'Attivo' : 'Non attivo' }}
                  </v-chip>
                </template>

                <template #bottom />
              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialogOpen = false">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Conferma Eliminazione</v-card-title>

        <v-card-text>
          Sei sicuro di voler eliminare il gruppo "{{ groupToDelete?.name }}"?
          <br />
          <strong>Attenzione:</strong> Gli atleti associati non verranno eliminati, ma non
          avranno più un gruppo assegnato.
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" @click="deleteGroup">Elimina</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGroupsStore } from '@/stores/groups'
import { useAuthStore } from '@/stores/auth'
import type { Group } from '@/types/group.types'

const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditMode = ref(false)
const formRef = ref<any>(null)
const groupToDelete = ref<Group | null>(null)

const formData = ref({
  name: '',
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const headers = [
  { title: 'Nome Gruppo', key: 'name', sortable: true },
  { title: 'Data Creazione', key: 'createdAt', sortable: true },
  { title: 'N. Atleti', key: '_count.members', sortable: true },
  { title: 'Azioni', key: 'actions', sortable: false, align: 'center' },
]

const membersHeaders = [
  { title: 'Cognome Nome', key: 'fullName', sortable: true },
  { title: 'Codice Fiscale', key: 'fiscalCode', sortable: true },
  { title: 'Telefono', key: 'phone', sortable: false },
  { title: 'Stato', key: 'isActive', sortable: true },
]

onMounted(async () => {
  try {
    await groupsStore.fetchGroups()
  } catch (error) {
    showSnackbar('Errore nel caricamento dei gruppi', 'error')
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT')
}

const openCreateDialog = () => {
  isEditMode.value = false
  formData.value = {
    name: '',
  }
  dialogOpen.value = true
}

const editGroup = (group: Group) => {
  isEditMode.value = true
  groupsStore.currentGroup = group as any
  formData.value = {
    name: group.name,
  }
  dialogOpen.value = true
}

const viewGroup = async (group: Group) => {
  try {
    await groupsStore.fetchGroupById(group.id)
    viewDialogOpen.value = true
  } catch (error) {
    showSnackbar('Errore nel caricamento dei dettagli del gruppo', 'error')
  }
}

const editFromView = () => {
  viewDialogOpen.value = false
  if (groupsStore.currentGroup) {
    isEditMode.value = true
    formData.value = {
      name: groupsStore.currentGroup.name,
    }
    dialogOpen.value = true
  }
}

const saveGroup = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    if (isEditMode.value && groupsStore.currentGroup) {
      await groupsStore.updateGroup(groupsStore.currentGroup.id, formData.value)
      showSnackbar('Gruppo aggiornato con successo', 'success')
    } else {
      await groupsStore.createGroup(formData.value)
      showSnackbar('Gruppo creato con successo', 'success')
    }
    dialogOpen.value = false
  } catch (error) {
    showSnackbar(
      isEditMode.value
        ? "Errore nell'aggiornamento del gruppo"
        : 'Errore nella creazione del gruppo',
      'error'
    )
  }
}

const confirmDelete = (group: Group) => {
  groupToDelete.value = group
  deleteDialogOpen.value = true
}

const deleteGroup = async () => {
  if (!groupToDelete.value) return

  try {
    await groupsStore.deleteGroup(groupToDelete.value.id)
    showSnackbar('Gruppo eliminato con successo', 'success')
    deleteDialogOpen.value = false
    groupToDelete.value = null
  } catch (error) {
    showSnackbar("Errore nell'eliminazione del gruppo", 'error')
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = {
    show: true,
    message,
    color,
  }
}
</script>
