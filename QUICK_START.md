# Quick Start - Gestionale Canottaggio

## Cosa è stato creato

### Backend (NestJS + Prisma + PostgreSQL)
- ✅ Struttura modulare NestJS completa
- ✅ Schema Prisma con 11 entità (User, Member, Training, Boat, Race, Payment, etc.)
- ✅ Modulo Auth completo (JWT + Refresh Token)
- ✅ Guards e decoratori per autorizzazione
- ✅ Script di seed con dati di esempio
- ✅ Swagger documentation integrata

### Frontend (Vue 3 + Vuetify)
- ✅ Configurazione Vite + TypeScript
- ✅ Package.json con tutte le dipendenze

### DevOps
- ✅ Docker Compose per tutto lo stack
- ✅ Dockerfile.dev per backend e frontend
- ✅ Hot reload attivo per sviluppo

---

## Avvio Rapido (CONSIGLIATO)

### 1. Installa le dipendenze

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Copia i file .env

```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

### 3. Avvia tutto con Docker

Dalla root del progetto:

```bash
npm run dev
```

Questo comando avvia:
- PostgreSQL su porta 5432
- Backend su porta 3000
- Frontend su porta 5173

### 4. Inizializza il database

In un nuovo terminale:

```bash
# Entra nel container backend
docker exec -it gestionale-backend sh

# Esegui le migration
npx prisma migrate dev --name init

# Esegui il seed
npx prisma db seed

# Esci dal container
exit
```

### 5. Accedi all'applicazione

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api

---

## Credenziali di Test

Dopo il seed, puoi usare questi account:

| Ruolo | Email | Password |
|---|---|---|
| **Admin** | admin@canottaggio.it | Admin123! |
| **Segreteria** | segreteria@canottaggio.it | Admin123! |
| **Allenatore** | allenatore@canottaggio.it | Admin123! |
| **Atleta 1** | atleta1@canottaggio.it | Admin123! |
| **Atleta 2** | atleta2@canottaggio.it | Admin123! |

---

## Sviluppo Locale (senza Docker)

### Prerequisiti
- Node.js 18+
- PostgreSQL 15+ installato localmente

### 1. Configura PostgreSQL

Crea database e utente:

```sql
CREATE USER gestionale_user WITH PASSWORD 'gestionale_pass';
CREATE DATABASE gestionale_canottaggio OWNER gestionale_user;
```

### 2. Backend

```bash
cd backend

# Installa dipendenze
npm install

# Copia e configura .env
cp .env.example .env
# Modifica DATABASE_URL se necessario

# Esegui migration
npx prisma migrate dev

# Esegui seed
npx prisma db seed

# Avvia backend
npm run start:dev
```

Backend disponibile su: http://localhost:3000

### 3. Frontend

```bash
cd frontend

# Installa dipendenze
npm install

# Copia .env
cp .env.example .env

# Avvia frontend
npm run dev
```

Frontend disponibile su: http://localhost:5173

---

## Comandi Utili

### Docker

```bash
# Avvia tutti i servizi
npm run dev

# Avvia con rebuild
npm run dev:build

# Stop servizi
npm run down

# Stop e cancella volumi (ATTENZIONE: cancella il DB!)
npm run clean

# Visualizza logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Entra in un container
docker exec -it gestionale-backend sh
docker exec -it gestionale-frontend sh
docker exec -it gestionale-postgres psql -U gestionale_user -d gestionale_canottaggio
```

### Database (Prisma)

```bash
cd backend

# Apri Prisma Studio (GUI database)
npx prisma studio

# Crea una nuova migration
npx prisma migrate dev --name nome_migration

# Genera Prisma Client (dopo modifiche allo schema)
npx prisma generate

# Reset database (ATTENZIONE: cancella tutti i dati!)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Backend

```bash
cd backend

# Sviluppo con hot reload
npm run start:dev

# Build produzione
npm run build

# Avvia produzione
npm run start:prod

# Test
npm run test

# Lint
npm run lint
```

### Frontend

```bash
cd frontend

# Sviluppo con hot reload
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## Test delle API con cURL

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@canottaggio.it",
    "password": "Admin123!"
  }'
```

Risposta:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@canottaggio.it",
    "role": "ADMIN",
    "member": null
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Get Profile

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Prossimi Step di Sviluppo

### 1. Frontend - Completare l'UI
- [ ] Creare componenti di base (main.ts, App.vue, router)
- [ ] Implementare Pinia store per auth
- [ ] Creare servizio API con Axios + interceptors
- [ ] Implementare pagina di login
- [ ] Creare layout principale con navigation
- [ ] Implementare dashboard

### 2. Backend - Moduli Aggiuntivi
- [ ] Modulo Members (CRUD atleti)
- [ ] Modulo Trainings (gestione allenamenti)
- [ ] Modulo Equipment (gestione barche)
- [ ] Modulo Races (gestione gare)
- [ ] Modulo Billing (gestione pagamenti)

### 3. Features Avanzate
- [ ] Upload certificati medici
- [ ] Export/import dati (CSV, Excel)
- [ ] Statistiche e report
- [ ] Notifiche email
- [ ] PWA per mobile

---

## Troubleshooting

### Porta già in uso

```bash
# Trova processo sulla porta 3000 o 5173
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Termina processo (Windows)
taskkill /PID <PID> /F
```

### Docker containers non si avviano

```bash
# Pulisci tutto
npm run clean

# Rebuild completo
docker-compose build --no-cache
npm run dev:build
```

### Database connection error

Verifica che PostgreSQL sia avviato:
```bash
docker-compose ps
```

Se il container postgres non è running:
```bash
docker-compose up postgres -d
```

### Prisma Client non aggiornato

```bash
cd backend
npx prisma generate
```

---

## Struttura File Creati

```
gestionaleSport/
├── ARCHITETTURA.md           # Documentazione architettura completa
├── README.md                 # Documentazione generale
├── QUICK_START.md           # Questa guida
├── docker-compose.yml        # Configurazione Docker
├── package.json              # Script root
├── .gitignore
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/             # ✅ Modulo Auth completo
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   ├── strategies/   # JWT + Refresh
│   │   │   └── guards/
│   │   ├── common/           # Guards, decorators, filters
│   │   └── prisma/           # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma     # ✅ Schema completo (11 entità)
│   │   └── seed.ts           # ✅ Dati di esempio
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── Dockerfile.dev
│   └── .env.example
│
└── frontend/
    ├── src/                  # Da completare
    ├── package.json          # ✅ Dipendenze configurate
    ├── vite.config.ts        # ✅ Configurato
    ├── tsconfig.json
    ├── index.html
    ├── Dockerfile.dev
    └── .env.example
```

---

## Link Utili

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)

---

**Buon sviluppo! 🚀**
