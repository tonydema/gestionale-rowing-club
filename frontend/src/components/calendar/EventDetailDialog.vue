<template>
  <v-dialog :model-value="modelValue" max-width="800px" scrollable>
    <v-card v-if="event">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-chip :color="EVENT_TYPE_COLORS[event.type]" :prepend-icon="EVENT_TYPE_ICONS[event.type]" class="mr-3">
            {{ EVENT_TYPE_LABELS[event.type] }}
          </v-chip>
          <span>{{ event.title }}</span>
        </div>
        <div v-if="authStore.isAdmin || authStore.isSegreteria || authStore.isAllenatore" class="d-flex gap-2">
          <v-btn
            color="primary"
            variant="text"
            icon="mdi-pencil"
            @click="$emit('edit')"
          />
          <v-btn
            color="error"
            variant="text"
            icon="mdi-delete"
            @click="$emit('delete')"
          />
        </div>
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-6">
        <v-row>
          <!-- Data e Ora -->
          <v-col cols="12">
            <h3 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-clock-outline</v-icon>
              Data e Ora
            </h3>
            <v-divider class="mb-3" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :model-value="formatDateTime(event.startDateTime)"
              label="Data e Ora Inizio"
              readonly
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar-start"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :model-value="formatDateTime(event.endDateTime)"
              label="Data e Ora Fine"
              readonly
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar-end"
            />
          </v-col>

          <!-- Descrizione -->
          <v-col v-if="event.description" cols="12">
            <h3 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-text</v-icon>
              Descrizione
            </h3>
            <v-divider class="mb-3" />
            <v-textarea
              :model-value="event.description"
              readonly
              variant="outlined"
              density="comfortable"
              auto-grow
            />
          </v-col>

          <!-- Istruttori/Allenatori -->
          <v-col v-if="event.coaches.length > 0" cols="12">
            <h3 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-whistle</v-icon>
              {{ event.type === 'DISPONIBILITA_ALLENATORE' ? 'Allenatore' : 'Istruttori' }}
            </h3>
            <v-divider class="mb-3" />
            <v-chip
              v-for="coach in event.coaches"
              :key="coach.id"
              color="green"
              class="mr-2 mb-2"
              prepend-icon="mdi-account-tie"
            >
              {{
                coach.user.member
                  ? `${coach.user.member.firstName} ${coach.user.member.lastName}`
                  : coach.user.username
              }}
            </v-chip>
          </v-col>

          <!-- Partecipanti -->
          <v-col v-if="event.participants.length > 0" cols="12">
            <h3 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-account-group</v-icon>
              Partecipanti ({{ event.participants.length }})
            </h3>
            <v-divider class="mb-3" />
            <v-chip
              v-for="participant in event.participants"
              :key="participant.id"
              color="blue"
              class="mr-2 mb-2"
              prepend-icon="mdi-account"
            >
              {{
                participant.user.member
                  ? `${participant.user.member.firstName} ${participant.user.member.lastName}`
                  : participant.user.username
              }}
            </v-chip>
          </v-col>

          <!-- Note -->
          <v-col v-if="event.notes" cols="12">
            <h3 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-note-text</v-icon>
              Note
            </h3>
            <v-divider class="mb-3" />
            <v-textarea
              :model-value="event.notes"
              readonly
              variant="outlined"
              density="comfortable"
              auto-grow
            />
          </v-col>

          <!-- Info creazione -->
          <v-col cols="12">
            <v-divider class="my-3" />
            <div class="text-caption text-grey">
              Creato da: {{ event.createdBy.username }} il
              {{ formatDateTime(event.createdAt) }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="$emit('close')">Chiudi</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '@/types/calendar.types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS } from '@/types/calendar.types'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  modelValue: boolean
  event: CalendarEvent | null
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'close'): void
}>()

const authStore = useAuthStore()

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
