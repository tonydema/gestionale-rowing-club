# 🚀 Avvio Rapido - Guida Passo-Passo

## Prerequisiti Verificati

Prima di iniziare, verifica di avere:
- ✅ Docker Desktop installato e in esecuzione
- ✅ Node.js 18+ installato (opzionale, per npm)

---

## Metodo Consigliato: Docker Compose

### Passo 1: Installa le dipendenze

Apri un terminale nella cartella del progetto:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Torna alla root
cd ..
```

### Passo 2: Avvia tutto con Docker Compose

```bash
npm run dev
```

Questo comando avvia:
- PostgreSQL (porta 5432)
- Backend NestJS (porta 3000)
- Frontend Vue (porta 5173)

**Attendi** che tutti i container siano pronti (circa 30-60 secondi).

### Passo 3: Inizializza il Database

**In un NUOVO terminale** (lascia il primo aperto):

```bash
# Entra nel container backend
docker exec -it gestionale-backend sh

# Crea le tabelle (migration)
npx prisma migrate dev --name init

# Popola con dati di test
npx prisma db seed

# Esci dal container
exit
```

### Passo 4: Apri il Browser

Vai su: **http://localhost:5173**

Dovresti vedere la pagina di login!

### Passo 5: Fai Login

Usa una di queste credenziali:

- **Admin**: admin@canottaggio.it / Admin123!
- **Segreteria**: segreteria@canottaggio.it / Admin123!
- **Allenatore**: allenatore@canottaggio.it / Admin123!
- **Atleta**: atleta1@canottaggio.it / Admin123!

---

## ✅ Cosa Puoi Fare Ora

Dopo il login vedrai:

1. **Dashboard** con cards informative
2. **Menu laterale** con voci filtrate in base al ruolo
3. **Profilo utente** (click sull'avatar in alto a destra)
4. Puoi navigare tra le sezioni (alcune sono placeholder)

### Testa i Diversi Ruoli

1. Logout (menu utente → Esci)
2. Login con un altro ruolo
3. Nota come il menu cambia in base ai permessi

---

## 🔍 Verifica che Tutto Funzioni

### Frontend (http://localhost:5173)
- ✅ Pagina login si carica
- ✅ Login funziona
- ✅ Redirect a dashboard
- ✅ Menu laterale visibile
- ✅ Snackbar mostra "Benvenuto..."

### Backend (http://localhost:3000/api/v1)
Dovrebbe rispondere con:
```json
{"statusCode":404,"message":"Cannot GET /api/v1"}
```

### Swagger Docs (http://localhost:3000/api)
- ✅ Documentazione API visibile
- ✅ Endpoint /auth/* presenti

---

## 🛠️ Comandi Utili

### Logs in tempo reale

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

### Stop e Restart

```bash
# Stop tutti i servizi
npm run down

# Restart
npm run dev
```

### Reset Completo (ATTENZIONE: Cancella il DB!)

```bash
npm run clean
npm run dev
# Poi rifai migrate + seed
```

### Prisma Studio (GUI Database)

```bash
docker exec -it gestionale-backend sh
npx prisma studio
# Apri http://localhost:5555
```

---

## ❌ Troubleshooting

### Porta già in uso

**Errore**: `Port 3000 is already in use`

**Soluzione**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Container non si avvia

```bash
# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Migration fallisce

```bash
# Entra nel container
docker exec -it gestionale-backend sh

# Verifica connessione DB
npx prisma db push

# Se serve, reset
npx prisma migrate reset
npx prisma db seed
```

### Frontend mostra errore di connessione

Verifica che il backend sia avviato:
```bash
curl http://localhost:3000/api/v1/auth/me
# Dovrebbe dare 401 Unauthorized (normale senza token)
```

---

## 🎯 Test Rapidi

### Test 1: Login e Dashboard

1. Vai su http://localhost:5173
2. Login con admin@canottaggio.it / Admin123!
3. ✅ Dovresti vedere la dashboard con cards

### Test 2: Autorizzazioni

1. Login come ATLETA (atleta1@canottaggio.it)
2. ✅ Menu NON mostra "Atleti" e "Pagamenti"
3. Logout
4. Login come ADMIN
5. ✅ Menu mostra TUTTE le voci

### Test 3: Profilo

1. Click sull'avatar in alto a destra
2. Click "Profilo"
3. ✅ Vedi i tuoi dati

### Test 4: API Backend

```bash
# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@canottaggio.it\",\"password\":\"Admin123!\"}"

# Dovresti ricevere accessToken e refreshToken
```

---

## 📱 Cosa Funziona Già

### ✅ Completamente Funzionante

- Login/Logout
- Autenticazione JWT
- Refresh token automatico
- Dashboard personalizzata per ruolo
- Menu con autorizzazioni
- Profilo utente
- Snackbar per notifiche
- Layout responsive

### 🚧 Placeholder (Da Implementare)

- Lista atleti (mostra solo messaggio "in sviluppo")
- Lista allenamenti (placeholder)
- Lista barche (placeholder)
- Lista gare (placeholder)
- Pagamenti (placeholder)

---

## 🎉 Successo!

Se vedi la dashboard dopo il login, **TUTTO FUNZIONA!** 🎉

Ora puoi:
1. Esplorare l'interfaccia
2. Testare i diversi ruoli
3. Iniziare a implementare i moduli CRUD rimanenti

---

## 📚 Prossimi Step

Leggi [STATO_PROGETTO.md](STATO_PROGETTO.md) per capire cosa implementare dopo.

**Suggerimento**: Inizia con il modulo Members (gestione atleti) - è il più importante!
