<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Allenamenti</h1>
        <p class="text-grey-darken-1 mt-2">Programma e gestione degli allenamenti</p>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Calendario Allenamenti</span>
        <v-btn
          v-if="authStore.isAdmin || authStore.isAllenatore"
          color="primary"
          prepend-icon="mdi-plus"
        >
          Nuovo Allenamento
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert type="info" variant="tonal"> Sezione in sviluppo </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>
