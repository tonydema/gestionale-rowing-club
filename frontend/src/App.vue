<template>
  <v-app>
    <router-view />

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="uiStore.snackbar"
      :color="uiStore.snackbarColor"
      :timeout="uiStore.snackbarTimeout"
      location="top right"
    >
      {{ uiStore.snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="uiStore.closeSnackbar"> Chiudi </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: 'Roboto', sans-serif;
}
</style>
