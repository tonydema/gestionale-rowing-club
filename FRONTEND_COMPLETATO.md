# Frontend Completato ✅

Il frontend Vue 3 + Vuetify è ora **completo e funzionante**!

## 🎯 Cosa è stato implementato

### ✅ Struttura Base
- [x] Configurazione Vite + TypeScript
- [x] Vuetify 3 con tema personalizzato
- [x] Vue Router con route guards
- [x] Pinia stores (auth + ui)

### ✅ Autenticazione
- [x] Servizio API con Axios + interceptors
- [x] Refresh token automatico
- [x] Auth store completo
- [x] Pagina login con validazione
- [x] Navigation guards

### ✅ Layout e UI
- [x] Layout principale con navigation drawer
- [x] App bar con menu utente
- [x] Snackbar globale per notifiche
- [x] Dashboard con statistiche
- [x] Autorizzazioni basate su ruolo

### ✅ Views Implementate
- [x] Login page (completa)
- [x] Dashboard (completa con info per ruolo)
- [x] Profile page (completa)
- [x] Members (placeholder)
- [x] Trainings (placeholder)
- [x] Equipment (placeholder)
- [x] Races (placeholder)
- [x] Billing (placeholder)

---

## 🚀 Come Avviare

### Metodo 1: Docker Compose (Consigliato)

```bash
# 1. Dalla root del progetto, installa dipendenze
cd backend
npm install
cd ../frontend
npm install
cd ..

# 2. Avvia tutto con Docker
npm run dev

# 3. In un ALTRO terminale, inizializza il database
docker exec -it gestionale-backend sh
npx prisma migrate dev --name init
npx prisma db seed
exit
```

### Metodo 2: Sviluppo Locale

**Terminal 1 - Database:**
```bash
docker-compose up postgres
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🌐 Accesso all'Applicazione

Una volta avviato, apri il browser su:

**http://localhost:5173**

Ti verrà mostrata la pagina di login.

---

## 👤 Credenziali di Test

Usa una di queste credenziali per accedere:

| Ruolo | Email | Password | Permessi |
|---|---|---|---|
| **Admin** | admin@canottaggio.it | Admin123! | Tutti i permessi |
| **Segreteria** | segreteria@canottaggio.it | Admin123! | Gestione atleti, pagamenti |
| **Allenatore** | allenatore@canottaggio.it | Admin123! | Allenamenti, presenze |
| **Atleta** | atleta1@canottaggio.it | Admin123! | Visualizzazione dati personali |

---

## 📱 Funzionalità Implementate

### Autenticazione
- ✅ Login con email/password
- ✅ Logout
- ✅ Refresh token automatico
- ✅ Persistenza sessione (localStorage)
- ✅ Redirect dopo login

### Dashboard
- ✅ Cards statistiche (placeholder)
- ✅ Azioni rapide basate su ruolo
- ✅ Informazioni personali per atleti
- ✅ Stato certificato medico

### Navigation
- ✅ Menu laterale con voci filtrate per ruolo
- ✅ Menu utente con profilo e logout
- ✅ Breadcrumb e navigation

### UI/UX
- ✅ Snackbar per notifiche success/error
- ✅ Loading states
- ✅ Validazione form
- ✅ Responsive design
- ✅ Icone Material Design

---

## 🔑 Autorizzazioni per Ruolo

Il sistema implementa autorizzazioni granulari:

### ADMIN
- Accesso completo a tutte le sezioni
- Può creare/modificare utenti
- Può gestire tutto

### SEGRETERIA
- Gestione atleti ✅
- Gestione pagamenti ✅
- Visualizzazione allenamenti ✅
- NO creazione allenamenti

### ALLENATORE
- Creazione allenamenti ✅
- Gestione presenze ✅
- Visualizzazione atleti ✅
- NO gestione pagamenti

### ATLETA
- Solo visualizzazione dati personali ✅
- Visualizzazione allenamenti ✅
- NO gestione

---

## 📂 Struttura File Frontend

```
frontend/src/
├── main.ts                    # Entry point
├── App.vue                    # Root component
├── env.d.ts                   # TypeScript env types
│
├── plugins/
│   └── vuetify.ts            # Vuetify config
│
├── router/
│   └── index.ts              # Routes + guards
│
├── stores/
│   ├── auth.ts               # Auth state management
│   └── ui.ts                 # UI state (snackbar, drawer)
│
├── services/
│   ├── api.ts                # Axios instance + interceptors
│   └── auth.service.ts       # Auth API calls
│
├── types/
│   ├── auth.types.ts         # Auth interfaces
│   └── api.types.ts          # API interfaces
│
├── components/
│   └── layout/
│       └── MainLayout.vue    # Main app layout
│
└── views/
    ├── auth/
    │   └── LoginView.vue     # ✅ Login page
    ├── dashboard/
    │   └── DashboardView.vue # ✅ Dashboard
    ├── profile/
    │   └── ProfileView.vue   # ✅ Profile page
    ├── members/
    │   ├── MembersListView.vue      # 🚧 Placeholder
    │   └── MemberDetailView.vue     # 🚧 Placeholder
    ├── trainings/
    │   └── TrainingsListView.vue    # 🚧 Placeholder
    ├── equipment/
    │   └── BoatsListView.vue        # 🚧 Placeholder
    ├── races/
    │   └── RacesListView.vue        # 🚧 Placeholder
    └── billing/
        └── PaymentsView.vue         # 🚧 Placeholder
```

---

## 🔄 Flusso Autenticazione

### 1. Login
```
User → LoginView → authStore.login()
     → authService.login() → POST /auth/login
     → Salva token in localStorage
     → Redirect a Dashboard
```

### 2. Request Autenticata
```
Component → api.get('/members')
         → Interceptor aggiunge header Authorization
         → Backend valida JWT
         → Risposta
```

### 3. Token Scaduto
```
Request → 401 Unauthorized
       → Interceptor cattura errore
       → POST /auth/refresh { refreshToken }
       → Salva nuovo accessToken
       → Riprova request originale
```

### 4. Logout
```
User → Click logout → authStore.logout()
    → POST /auth/logout
    → Rimuove token da localStorage
    → Redirect a /login
```

---

## 🎨 Personalizzazione

### Colori (vuetify.ts)

```typescript
colors: {
  primary: '#1976D2',    // Blu
  secondary: '#424242',  // Grigio
  success: '#4CAF50',    // Verde
  error: '#FF5252',      // Rosso
  warning: '#FFC107',    // Giallo
  info: '#2196F3',       // Azzurro
}
```

### Logo

Sostituisci l'icona `mdi-rowing` in:
- [MainLayout.vue:9](src/components/layout/MainLayout.vue#L9)
- [LoginView.vue:8](src/views/auth/LoginView.vue#L8)

---

## 🧪 Test dell'Applicazione

### 1. Test Login
- ✅ Accedi con admin@canottaggio.it
- ✅ Verifica redirect a dashboard
- ✅ Controlla che snackbar mostri "Benvenuto"

### 2. Test Autorizzazioni
- ✅ Accedi come ATLETA
- ✅ Verifica che menu NON mostri "Atleti" e "Pagamenti"
- ✅ Logout
- ✅ Accedi come ADMIN
- ✅ Verifica che menu mostri tutte le voci

### 3. Test Refresh Token
- ✅ Apri DevTools → Application → LocalStorage
- ✅ Cancella `accessToken`
- ✅ Fai una richiesta (es. vai su Profilo)
- ✅ Verifica che funzioni (refresh automatico)

### 4. Test Logout
- ✅ Clicca Logout
- ✅ Verifica redirect a /login
- ✅ Verifica che localStorage sia vuoto
- ✅ Prova ad accedere a / (deve redirect a /login)

---

## 🚧 Prossimi Step

Le sezioni con placeholder possono essere sviluppate seguendo questo pattern:

### Esempio: Implementare Members List

1. **Creare il service**
```typescript
// services/members.service.ts
export const membersService = {
  async getAll() {
    const response = await api.get('/members')
    return response.data
  }
  // ...
}
```

2. **Creare lo store**
```typescript
// stores/members.ts
export const useMembersStore = defineStore('members', () => {
  const members = ref([])
  // ...
})
```

3. **Implementare la view**
```vue
<!-- views/members/MembersListView.vue -->
<script setup>
import { useMembersStore } from '@/stores/members'
const membersStore = useMembersStore()
// ...
</script>
```

4. **Creare i moduli backend**
- Backend: modulo Members (controller + service)
- Endpoints: GET, POST, PUT, DELETE /members

---

## 📚 Risorse Utili

- **Vue 3**: https://vuejs.org/
- **Vuetify 3**: https://vuetifyjs.com/
- **Pinia**: https://pinia.vuejs.org/
- **Vue Router**: https://router.vuejs.org/
- **Axios**: https://axios-http.com/

---

## ✅ Checklist Completamento

- [x] Setup progetto
- [x] Configurazione Vuetify
- [x] Router con guards
- [x] Servizio API con interceptors
- [x] Auth store
- [x] UI store
- [x] Login page funzionante
- [x] Layout con navigation
- [x] Dashboard
- [x] Profile page
- [x] Autorizzazioni per ruolo
- [x] Refresh token automatico
- [ ] Implementare CRUD Members
- [ ] Implementare CRUD Trainings
- [ ] Implementare CRUD Equipment
- [ ] Implementare CRUD Races
- [ ] Implementare CRUD Billing

---

**Il frontend è pronto per essere utilizzato!** 🎉

Puoi ora:
1. Avviare l'applicazione
2. Fare login con le credenziali di test
3. Esplorare l'interfaccia
4. Iniziare a implementare le sezioni rimanenti

Oppure procedi con l'implementazione dei moduli backend rimanenti (Members, Trainings, etc.).
