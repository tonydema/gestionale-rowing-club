<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">
          Dashboard
          <v-chip color="primary" class="ml-2">{{ getRoleLabel(authStore.userRole) }}</v-chip>
        </h1>
        <p class="text-grey-darken-1 mt-2">
          Benvenuto, {{ authStore.user?.member?.firstName || authStore.user?.email }}!
        </p>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col v-if="canViewMembers" cols="12" sm="6" md="3">
        <v-card color="blue" variant="tonal">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ activeAthletesCount }}</div>
                <div class="text-subtitle-1">Atleti Attivi</div>
              </div>
              <v-icon size="48" color="blue">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="green" variant="tonal">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">--</div>
                <div class="text-subtitle-1">Allenamenti</div>
              </div>
              <v-icon size="48" color="green">mdi-calendar-clock</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="orange" variant="tonal">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">--</div>
                <div class="text-subtitle-1">Barche</div>
              </div>
              <v-icon size="48" color="orange">mdi-ferry</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="purple" variant="tonal">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">--</div>
                <div class="text-subtitle-1">Gare</div>
              </div>
              <v-icon size="48" color="purple">mdi-trophy</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Azioni Rapide</h2>
      </v-col>

      <v-col v-if="authStore.isAllenatore || authStore.isAdmin" cols="12" sm="6" md="4">
        <v-card>
          <v-card-text>
            <v-icon size="48" color="primary" class="mb-2">mdi-calendar-plus</v-icon>
            <h3 class="text-h6 mb-2">Nuovo Allenamento</h3>
            <p class="text-grey-darken-1">Programma un nuovo allenamento per gli atleti</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="text" :to="{ name: 'Trainings' }">
              Crea Allenamento
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="canViewMembers" cols="12" sm="6" md="4">
        <v-card>
          <v-card-text>
            <v-icon size="48" color="green" class="mb-2">mdi-account-plus</v-icon>
            <h3 class="text-h6 mb-2">Nuovo Atleta</h3>
            <p class="text-grey-darken-1">Registra un nuovo atleta nel sistema</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" variant="text" :to="{ name: 'Members' }">
              Aggiungi Atleta
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card>
          <v-card-text>
            <v-icon size="48" color="orange" class="mb-2">mdi-trophy-outline</v-icon>
            <h3 class="text-h6 mb-2">Prossime Gare</h3>
            <p class="text-grey-darken-1">Visualizza il calendario delle gare</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="orange" variant="text" :to="{ name: 'Races' }">
              Vedi Gare
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- User Info (for athletes) -->
    <v-row v-if="authStore.isAtleta && authStore.user?.member" class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">I miei dati</h2>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Informazioni Personali</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Nome Completo</v-list-item-title>
                <v-list-item-subtitle>
                  {{ authStore.user.member.firstName }} {{ authStore.user.member.lastName }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Tipo Tesseramento</v-list-item-title>
                <v-list-item-subtitle>
                  {{ authStore.user.member.membershipType }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="authStore.user.member.phone">
                <v-list-item-title>Telefono</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user.member.phone }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Certificato Medico</v-card-title>
          <v-card-text>
            <div v-if="authStore.user.member.medicalCert">
              <v-alert
                :type="isMedicalCertValid ? 'success' : 'warning'"
                variant="tonal"
                class="mb-2"
              >
                <div>Tipo: {{ authStore.user.member.medicalCert.certType }}</div>
                <div>
                  Scadenza:
                  {{ formatDate(authStore.user.member.medicalCert.expiryDate) }}
                </div>
                <div v-if="!isMedicalCertValid" class="font-weight-bold mt-2">
                  ⚠️ Certificato scaduto o in scadenza
                </div>
              </v-alert>
            </div>
            <v-alert v-else type="error" variant="tonal">
              Nessun certificato medico presente
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMembersStore } from '@/stores/members'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const authStore = useAuthStore()
const membersStore = useMembersStore()

const activeAthletesCount = ref(0)

const canViewMembers = computed(() => {
  return authStore.isAdmin || authStore.isSegreteria || authStore.isAllenatore
})

onMounted(async () => {
  if (canViewMembers.value) {
    try {
      await membersStore.fetchMembers({ page: 1, limit: 1000, isActive: true })
      activeAthletesCount.value = membersStore.members.filter(m => m.isActive).length
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }
})

const isMedicalCertValid = computed(() => {
  if (!authStore.user?.member?.medicalCert) return false
  const expiryDate = new Date(authStore.user.member.medicalCert.expiryDate)
  const today = new Date()
  return expiryDate > today
})

function getRoleLabel(role?: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Amministratore',
    SEGRETERIA: 'Segreteria',
    ALLENATORE: 'Allenatore',
    ATLETA: 'Atleta',
  }
  return role ? labels[role] || role : ''
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd MMMM yyyy', { locale: it })
}
</script>
