# Gestionale Canottaggio 🚣

Sistema gestionale completo per società sportiva di canottaggio.

## 🎯 Caratteristiche

- ✅ **Autenticazione JWT** con refresh token
- ✅ **4 Ruoli Utente**: Admin, Segreteria, Allenatore, Atleta
- ✅ **Gestione Atleti** con categorie automatiche
- ✅ **Gestione Gruppi**
- ✅ **Allenamenti** con calendario
- ✅ **Rendicontazione** con tipologie configurabili
- ✅ **Frontend Responsive** con Vuetify 3
- ✅ **Backend API-First** con Swagger docs

## 🚀 Deploy su Railway (Produzione)

### Prerequisiti
- Account [Railway](https://railway.app)
- Account [GitHub](https://github.com)

### Step 1: Fork o Push su GitHub

```bash
# Clona e pusha su tuo repository GitHub
git clone https://github.com/YOUR_USERNAME/gestionale-canottaggio.git
cd gestionale-canottaggio
```

### Step 2: Crea progetto su Railway

1. Vai su [Railway](https://railway.app) e accedi con GitHub
2. Clicca "New Project" → "Deploy from GitHub repo"
3. Seleziona il repository

### Step 3: Aggiungi PostgreSQL

1. Nel progetto Railway, clicca "New" → "Database" → "PostgreSQL"
2. Railway creerà automaticamente la variabile `DATABASE_URL`

### Step 4: Deploy Backend

1. Clicca "New" → "GitHub Repo" → seleziona il repo
2. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npx prisma db seed && node dist/main.js`

3. Aggiungi variabili ambiente:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=genera-una-stringa-sicura-32-caratteri-min
   JWT_REFRESH_SECRET=genera-altra-stringa-sicura-diversa
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://YOUR-FRONTEND.railway.app
   ```

4. Genera un dominio pubblico: Settings → Networking → Generate Domain

### Step 5: Deploy Frontend

1. Clicca "New" → "GitHub Repo" → stesso repo
2. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`

3. Aggiungi variabili ambiente:
   ```
   VITE_API_URL=https://YOUR-BACKEND.railway.app/api/v1
   ```

4. Genera dominio pubblico

### Step 6: Aggiorna CORS

Torna al backend e aggiorna `CORS_ORIGIN` con l'URL reale del frontend.

---

## 💻 Sviluppo Locale

### Prerequisiti
- Node.js 18+
- Docker e Docker Compose

### Quick Start

```bash
# 1. Installa dipendenze
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Avvia con Docker
npm run dev

# 3. Inizializza database (in altro terminale)
docker exec -it gestionale-backend sh
npx prisma migrate dev --name init
npx prisma db seed
exit
```

### Accesso Locale

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api

## 👥 Credenziali Test

| Username | Password | Ruolo |
|----------|----------|-------|
| admin | Admin123! | Admin |
| segreteria | Admin123! | Segreteria |
| mrossi | Admin123! | Allenatore |
| lverdi | Admin123! | Atleta |
| sbianchi | Admin123! | Atleta |

## 📁 Struttura Progetto

```
gestionaleSport/
├── backend/           # Backend NestJS + Prisma
│   ├── src/
│   │   ├── auth/         # Autenticazione JWT
│   │   ├── members/      # Gestione atleti
│   │   ├── groups/       # Gestione gruppi
│   │   ├── workouts/     # Allenamenti
│   │   ├── reporting/    # Rendicontazioni
│   │   ├── report-types/ # Tipi rendicontazione
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── Dockerfile
│
├── frontend/          # Frontend Vue 3 + Vuetify
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── stores/
│   │   └── ...
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## 🔧 Comandi Utili

### Backend
```bash
cd backend
npm run start:dev     # Sviluppo
npm run build         # Build
npx prisma studio     # GUI database
npx prisma migrate dev # Crea migration
```

### Frontend
```bash
cd frontend
npm run dev           # Sviluppo
npm run build         # Build
npm run preview       # Preview build
```

### Docker
```bash
npm run dev           # Avvia tutto
npm run down          # Stop
docker-compose logs -f backend   # Logs backend
docker-compose logs -f frontend  # Logs frontend
```

## 📚 API Documentation

Con il backend in esecuzione, visita:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000/api/v1

## 🔐 Sicurezza

Prima di andare in produzione:

1. **Cambia i segreti JWT** - Usa stringhe lunghe e casuali
2. **Configura CORS** - Imposta solo i domini autorizzati
3. **HTTPS** - Railway lo fornisce automaticamente
4. **Variabili ambiente** - Non committare mai file `.env`

## License

ISC
