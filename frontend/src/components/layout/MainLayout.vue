<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="uiStore.toggleDrawer" />

      <v-toolbar-title class="d-flex align-center">
        <v-icon size="32" class="mr-2">mdi-rowing</v-icon>
        <span>Gestionale Canottaggio</span>
      </v-toolbar-title>

      <v-spacer />

      <!-- User menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="white" size="40">
              <v-icon color="primary">mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>{{ authStore.user?.email }}</v-list-item-title>
            <v-list-item-subtitle>{{ getRoleLabel(authStore.userRole) }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider />
          <v-list-item :to="{ name: 'Profile' }" prepend-icon="mdi-account">
            <v-list-item-title>Profilo</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-logout" @click="handleLogout">
            <v-list-item-title>Esci</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="uiStore.drawer" app>
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="{ name: 'Dashboard' }"
        />

        <v-divider class="my-2" />

        <!-- Atleti -->
        <v-list-item
          v-if="canViewMembers"
          prepend-icon="mdi-account-group"
          title="Atleti"
          :to="{ name: 'Members' }"
        />

        <!-- Gruppi -->
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Gruppi"
          :to="{ name: 'Groups' }"
        />

        <!-- Calendario -->
        <v-list-item
          prepend-icon="mdi-calendar-month"
          title="Calendario"
          :to="{ name: 'Calendar' }"
        />

        <!-- Allenamenti -->
        <v-list-item
          prepend-icon="mdi-dumbbell"
          title="Allenamenti"
          :to="{ name: 'Workouts' }"
        />

        <!-- Rendicontazione - Con sottovoci -->
        <v-list-group v-if="canViewReporting" prepend-icon="mdi-file-document-edit">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Rendicontazione" />
          </template>

          <v-list-item
            prepend-icon="mdi-file-document-multiple"
            title="Rendicontazioni"
            :to="{ name: 'Reporting' }"
          />

          <v-list-item
            v-if="canManageReportTypes"
            prepend-icon="mdi-tag-multiple"
            title="Tipi Rendicontazione"
            :to="{ name: 'ReportTypes' }"
          />
        </v-list-group>

        <!-- Pagamenti -->
        <v-list-item
          v-if="canViewBilling"
          prepend-icon="mdi-cash-multiple"
          title="Pagamenti"
          :to="{ name: 'Billing' }"
        />

        <v-divider class="my-2" />

        <!-- Profilo -->
        <v-list-item
          prepend-icon="mdi-account-circle"
          title="Il mio profilo"
          :to="{ name: 'Profile' }"
        />
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-card variant="tonal" color="blue-grey">
            <v-card-text class="text-caption">
              <div class="font-weight-bold mb-1">{{ authStore.user?.member?.firstName }} {{ authStore.user?.member?.lastName }}</div>
              <div class="text-grey-darken-1">{{ getRoleLabel(authStore.userRole) }}</div>
            </v-card-text>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const canViewMembers = computed(() => {
  return authStore.isAdmin || authStore.isSegreteria || authStore.isAllenatore
})

const canViewBilling = computed(() => {
  return authStore.isAdmin || authStore.isSegreteria
})

const canViewReporting = computed(() => {
  return authStore.isAdmin || authStore.isSegreteria || authStore.isAllenatore
})

const canManageReportTypes = computed(() => {
  return authStore.isAdmin || authStore.isSegreteria
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

async function handleLogout() {
  try {
    await authStore.logout()
    uiStore.showInfo('Disconnesso con successo')
    router.push({ name: 'Login' })
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
