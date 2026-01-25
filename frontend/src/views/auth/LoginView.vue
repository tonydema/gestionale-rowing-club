<template>
  <v-container fluid class="fill-height bg-blue-grey-lighten-5">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="bg-primary text-white pa-6">
            <div class="d-flex align-center">
              <v-icon size="32" class="mr-2">mdi-rowing</v-icon>
              <div>
                <div class="text-h5">Gestionale Canottaggio x</div>
                <div class="text-subtitle-2 text-blue-lighten-4">Accedi al sistema</div>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="valid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.username"
                label="Username"
                type="text"
                prepend-inner-icon="mdi-account"
                :rules="usernameRules"
                :error-messages="authStore.error && !valid ? [authStore.error] : []"
                variant="outlined"
                required
                autofocus
                @input="authStore.clearError"
              />

              <v-text-field
                v-model="form.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="passwordRules"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                @input="authStore.clearError"
              />

              <v-checkbox
                v-model="rememberMe"
                label="Ricorda password"
                color="primary"
                density="compact"
                hide-details
                class="mt-2"
              />

              <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4 mt-4">
                {{ authStore.error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.isLoading"
                :disabled="!valid"
                class="mt-2"
              >
                Accedi
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-text class="text-center pa-4">
            <div class="text-caption text-grey-darken-1">
              Credenziali di test: admin / Admin123!
            </div>
          </v-card-text>
        </v-card>

        <!-- Informazioni ruoli -->
        <v-card class="mt-4 elevation-4">
          <v-card-text>
            <div class="text-subtitle-2 mb-2">
              <v-icon size="small" class="mr-1">mdi-information</v-icon>
              Account di esempio
            </div>
            <v-list density="compact" class="bg-transparent">
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon color="red">mdi-shield-crown</v-icon>
                </template>
                <v-list-item-title>admin</v-list-item-title>
                <v-list-item-subtitle>Admin - Tutti i permessi</v-list-item-subtitle>
              </v-list-item>
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon color="orange">mdi-briefcase</v-icon>
                </template>
                <v-list-item-title>segreteria</v-list-item-title>
                <v-list-item-subtitle>Segreteria - Gestione amministrativa</v-list-item-subtitle>
              </v-list-item>
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon color="blue">mdi-whistle</v-icon>
                </template>
                <v-list-item-title>mrossi</v-list-item-title>
                <v-list-item-subtitle>Allenatore - Gestione allenamenti</v-list-item-subtitle>
              </v-list-item>
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon color="green">mdi-account</v-icon>
                </template>
                <v-list-item-title>lverdi</v-list-item-title>
                <v-list-item-subtitle>Atleta - Visualizzazione dati personali</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <div class="text-caption text-grey mt-2">Password per tutti: Admin123!</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const formRef = ref()
const valid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const form = ref({
  username: '',
  password: '',
})

const usernameRules = [
  (v: string) => !!v || 'Username richiesto',
]

const passwordRules = [(v: string) => !!v || 'Password richiesta']

// Carica credenziali salvate all'avvio
onMounted(() => {
  const savedCredentials = localStorage.getItem('savedCredentials')
  if (savedCredentials) {
    try {
      const { username, password } = JSON.parse(savedCredentials)
      form.value.username = username
      form.value.password = password
      rememberMe.value = true
    } catch (error) {
      console.error('Error loading saved credentials:', error)
    }
  }
})

async function handleLogin() {
  if (!formRef.value) return

  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  try {
    await authStore.login(form.value)

    // Salva o rimuovi credenziali in base alla checkbox
    if (rememberMe.value) {
      localStorage.setItem('savedCredentials', JSON.stringify({
        username: form.value.username,
        password: form.value.password,
      }))
    } else {
      localStorage.removeItem('savedCredentials')
    }

    uiStore.showSuccess(`Benvenuto, ${authStore.user?.username}!`)

    // Redirect alla pagina originale o dashboard
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error: any) {
    console.error('Login error:', error)
    // Errore già gestito nello store
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
