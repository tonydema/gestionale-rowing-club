<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-4">Il mio Profilo</h1>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Informazioni Account</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Ruolo</v-list-item-title>
                <v-list-item-subtitle>{{ getRoleLabel(authStore.userRole) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Stato</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="authStore.user?.isActive ? 'success' : 'error'" size="small">
                    {{ authStore.user?.isActive ? 'Attivo' : 'Non attivo' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="authStore.user?.member" cols="12" md="6">
        <v-card>
          <v-card-title>Dati Personali</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Nome Completo</v-list-item-title>
                <v-list-item-subtitle>
                  {{ authStore.user.member.firstName }} {{ authStore.user.member.lastName }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="authStore.user.member.fiscalCode">
                <v-list-item-title>Codice Fiscale</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user.member.fiscalCode }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="authStore.user.member.phone">
                <v-list-item-title>Telefono</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user.member.phone }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function getRoleLabel(role?: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Amministratore',
    SEGRETERIA: 'Segreteria',
    ALLENATORE: 'Allenatore',
    ATLETA: 'Atleta',
  }
  return role ? labels[role] || role : ''
}
</script>
