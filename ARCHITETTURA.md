# Architettura Gestionale Canottaggio

## Stack Tecnologico

### Backend
- **Framework**: NestJS + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Autenticazione**: JWT + Refresh Token
- **Validazione**: class-validator + class-transformer

### Frontend
- **Framework**: Vue 3 + TypeScript
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios

---

## Struttura Moduli Backend

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── filters/
│   ├── auth/                      # Autenticazione e autorizzazione
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users/                     # Gestione utenti
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── members/                   # Gestione atleti/tesserati
│   │   ├── members.module.ts
│   │   ├── members.controller.ts
│   │   ├── members.service.ts
│   │   └── dto/
│   ├── trainings/                 # Gestione allenamenti
│   │   ├── trainings.module.ts
│   │   ├── trainings.controller.ts
│   │   ├── trainings.service.ts
│   │   ├── attendances.service.ts
│   │   └── dto/
│   ├── equipment/                 # Gestione barche/attrezzatura
│   │   ├── equipment.module.ts
│   │   ├── boats.controller.ts
│   │   ├── boats.service.ts
│   │   └── dto/
│   ├── races/                     # Gestione gare
│   │   ├── races.module.ts
│   │   ├── races.controller.ts
│   │   ├── races.service.ts
│   │   └── dto/
│   └── billing/                   # Gestione pagamenti/quote
│       ├── billing.module.ts
│       ├── billing.controller.ts
│       ├── billing.service.ts
│       └── dto/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
└── package.json
```

---

## Schema Database (Prisma)

### Entità Principali

#### 1. Users (Utenti del sistema)
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String   // hashed
  role          Role     @default(ATLETA)
  isActive      Boolean  @default(true)
  refreshToken  String?  // per JWT refresh

  member        Member?  // relazione 1:1 con atleta

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Role {
  ADMIN
  SEGRETERIA
  ALLENATORE
  ATLETA
}
```

#### 2. Members (Atleti/Tesserati)
```prisma
model Member {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])

  firstName       String
  lastName        String
  fiscalCode      String    @unique
  dateOfBirth     DateTime
  placeOfBirth    String

  address         String
  city            String
  postalCode      String
  phone           String?
  emergencyPhone  String

  membershipDate  DateTime  @default(now())
  membershipType  MembershipType
  isActive        Boolean   @default(true)

  medicalCert     MedicalCertificate?
  attendances     Attendance[]
  raceParticipations RaceParticipation[]
  payments        Payment[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum MembershipType {
  AGONISTA
  AMATORE
  GIOVANE
  MASTER
}
```

#### 3. MedicalCertificate (Certificati medici)
```prisma
model MedicalCertificate {
  id            String   @id @default(uuid())
  memberId      String   @unique
  member        Member   @relation(fields: [memberId], references: [id])

  issueDate     DateTime
  expiryDate    DateTime
  certType      String   // "Agonistico" / "Non agonistico"
  doctorName    String

  isValid       Boolean  // computed: expiryDate > now

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 4. Trainings (Allenamenti)
```prisma
model Training {
  id            String   @id @default(uuid())

  name          String
  description   String?
  date          DateTime
  startTime     DateTime
  endTime       DateTime
  location      String   @default("Sede")

  coachId       String
  coach         User     @relation(fields: [coachId], references: [id])

  maxParticipants Int?
  notes         String?

  attendances   Attendance[]
  boatUsages    BoatUsage[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 5. Attendances (Presenze allenamenti)
```prisma
model Attendance {
  id          String   @id @default(uuid())

  trainingId  String
  training    Training @relation(fields: [trainingId], references: [id])

  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])

  status      AttendanceStatus @default(PRESENTE)
  notes       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([trainingId, memberId])
}

enum AttendanceStatus {
  PRESENTE
  ASSENTE
  GIUSTIFICATO
}
```

#### 6. Boats (Barche)
```prisma
model Boat {
  id            String   @id @default(uuid())

  name          String   @unique
  type          BoatType
  seats         Int      // 1, 2, 4, 8
  brand         String?
  model         String?
  serialNumber  String?

  purchaseDate  DateTime?
  purchasePrice Decimal?  @db.Decimal(10, 2)

  status        BoatStatus @default(DISPONIBILE)
  condition     String?   // Note sullo stato

  usages        BoatUsage[]
  maintenances  Maintenance[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum BoatType {
  SINGOLO
  DOPPIO
  QUATTRO_CON
  QUATTRO_SENZA
  OTTO
}

enum BoatStatus {
  DISPONIBILE
  IN_USO
  MANUTENZIONE
  FUORI_SERVIZIO
}
```

#### 7. BoatUsage (Utilizzo barche)
```prisma
model BoatUsage {
  id          String   @id @default(uuid())

  boatId      String
  boat        Boat     @relation(fields: [boatId], references: [id])

  trainingId  String?
  training    Training? @relation(fields: [trainingId], references: [id])

  raceId      String?
  race        Race?    @relation(fields: [raceId], references: [id])

  startTime   DateTime
  endTime     DateTime?
  notes       String?

  createdAt   DateTime @default(now())
}
```

#### 8. Maintenance (Manutenzioni)
```prisma
model Maintenance {
  id            String   @id @default(uuid())

  boatId        String
  boat          Boat     @relation(fields: [boatId], references: [id])

  date          DateTime @default(now())
  type          MaintenanceType
  description   String
  cost          Decimal? @db.Decimal(10, 2)
  performedBy   String?

  createdAt     DateTime @default(now())
}

enum MaintenanceType {
  ORDINARIA
  STRAORDINARIA
  RIPARAZIONE
}
```

#### 9. Races (Gare)
```prisma
model Race {
  id            String   @id @default(uuid())

  name          String
  location      String
  date          DateTime
  category      String   // "Regionali", "Nazionali", "Internazionali"

  description   String?
  registrationDeadline DateTime?

  participations RaceParticipation[]
  boatUsages    BoatUsage[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 10. RaceParticipation (Partecipazioni gare)
```prisma
model RaceParticipation {
  id          String   @id @default(uuid())

  raceId      String
  race        Race     @relation(fields: [raceId], references: [id])

  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])

  category    String   // "Senior", "Junior", "Master A", etc.
  result      String?  // "1°", "2°", "DNF", etc.
  time        String?  // "06:45.23"

  notes       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([raceId, memberId])
}
```

#### 11. Payments (Pagamenti)
```prisma
model Payment {
  id            String   @id @default(uuid())

  memberId      String
  member        Member   @relation(fields: [memberId], references: [id])

  type          PaymentType
  amount        Decimal  @db.Decimal(10, 2)
  dueDate       DateTime
  paidDate      DateTime?
  status        PaymentStatus @default(PENDING)

  year          Int      // Anno di riferimento
  description   String?
  notes         String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum PaymentType {
  QUOTA_ANNUALE
  QUOTA_MENSILE
  ISCRIZIONE_GARA
  ALTRO
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

---

## API Endpoints (REST v1)

### Auth Module
```
POST   /api/v1/auth/register      # Registrazione (solo ADMIN/SEGRETERIA)
POST   /api/v1/auth/login         # Login
POST   /api/v1/auth/refresh       # Refresh token
POST   /api/v1/auth/logout        # Logout
GET    /api/v1/auth/me            # Profilo utente corrente
```

### Users Module
```
GET    /api/v1/users              # Lista utenti (ADMIN/SEGRETERIA)
GET    /api/v1/users/:id          # Dettaglio utente
PUT    /api/v1/users/:id          # Modifica utente
DELETE /api/v1/users/:id          # Disattiva utente
PATCH  /api/v1/users/:id/role     # Cambia ruolo (ADMIN)
```

### Members Module
```
GET    /api/v1/members            # Lista atleti (paginata, filtri)
POST   /api/v1/members            # Crea atleta
GET    /api/v1/members/:id        # Dettaglio atleta
PUT    /api/v1/members/:id        # Modifica atleta
DELETE /api/v1/members/:id        # Disattiva atleta

GET    /api/v1/members/:id/medical-certificate
POST   /api/v1/members/:id/medical-certificate
PUT    /api/v1/members/:id/medical-certificate/:certId
```

### Trainings Module
```
GET    /api/v1/trainings          # Lista allenamenti
POST   /api/v1/trainings          # Crea allenamento (ALLENATORE/ADMIN)
GET    /api/v1/trainings/:id      # Dettaglio allenamento
PUT    /api/v1/trainings/:id      # Modifica allenamento
DELETE /api/v1/trainings/:id      # Elimina allenamento

GET    /api/v1/trainings/:id/attendances
POST   /api/v1/trainings/:id/attendances    # Registra presenze
PUT    /api/v1/trainings/:id/attendances/:attendanceId
```

### Equipment Module
```
GET    /api/v1/boats              # Lista barche
POST   /api/v1/boats              # Crea barca
GET    /api/v1/boats/:id          # Dettaglio barca
PUT    /api/v1/boats/:id          # Modifica barca
DELETE /api/v1/boats/:id          # Elimina barca

GET    /api/v1/boats/:id/usages   # Storico utilizzi
POST   /api/v1/boats/:id/usages   # Registra utilizzo

GET    /api/v1/boats/:id/maintenances
POST   /api/v1/boats/:id/maintenances
```

### Races Module
```
GET    /api/v1/races              # Lista gare
POST   /api/v1/races              # Crea gara
GET    /api/v1/races/:id          # Dettaglio gara
PUT    /api/v1/races/:id          # Modifica gara
DELETE /api/v1/races/:id          # Elimina gara

GET    /api/v1/races/:id/participations
POST   /api/v1/races/:id/participations
PUT    /api/v1/races/:id/participations/:participationId
DELETE /api/v1/races/:id/participations/:participationId
```

### Billing Module
```
GET    /api/v1/payments           # Lista pagamenti (filtri: member, year, status)
POST   /api/v1/payments           # Crea pagamento
GET    /api/v1/payments/:id       # Dettaglio pagamento
PUT    /api/v1/payments/:id       # Modifica pagamento
PATCH  /api/v1/payments/:id/pay   # Marca come pagato

GET    /api/v1/payments/overdue   # Pagamenti scaduti
GET    /api/v1/payments/stats     # Statistiche incassi
```

---

## Struttura Frontend

```
frontend/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/                    # Pinia stores
│   │   ├── auth.ts
│   │   ├── members.ts
│   │   ├── trainings.ts
│   │   └── ui.ts
│   ├── services/                  # API clients
│   │   ├── api.ts                 # Axios instance
│   │   ├── auth.service.ts
│   │   ├── members.service.ts
│   │   ├── trainings.service.ts
│   │   ├── equipment.service.ts
│   │   ├── races.service.ts
│   │   └── billing.service.ts
│   ├── views/                     # Pagine
│   │   ├── auth/
│   │   │   └── LoginView.vue
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue
│   │   ├── members/
│   │   │   ├── MembersListView.vue
│   │   │   ├── MemberDetailView.vue
│   │   │   └── MemberFormView.vue
│   │   ├── trainings/
│   │   │   ├── TrainingsListView.vue
│   │   │   ├── TrainingDetailView.vue
│   │   │   └── AttendanceView.vue
│   │   ├── equipment/
│   │   │   ├── BoatsListView.vue
│   │   │   └── BoatDetailView.vue
│   │   ├── races/
│   │   │   ├── RacesListView.vue
│   │   │   └── RaceDetailView.vue
│   │   └── billing/
│   │       └── PaymentsView.vue
│   ├── components/                # Componenti riutilizzabili
│   │   ├── layout/
│   │   │   ├── AppBar.vue
│   │   │   ├── NavDrawer.vue
│   │   │   └── Footer.vue
│   │   ├── common/
│   │   │   ├── DataTable.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   ├── DatePicker.vue
│   │   │   └── FileUpload.vue
│   │   └── members/
│   │       ├── MemberCard.vue
│   │       └── MedicalCertStatus.vue
│   ├── types/                     # TypeScript types/interfaces
│   │   ├── api.types.ts
│   │   ├── member.types.ts
│   │   ├── training.types.ts
│   │   └── auth.types.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   └── plugins/
│       └── vuetify.ts
├── public/
└── package.json
```

---

## Flusso Autenticazione

### 1. Login
```
Client → POST /api/v1/auth/login { email, password }
Server → Valida credenziali
Server → Genera accessToken (15min) + refreshToken (7d)
Server → Salva refreshToken (hash) in DB
Server → Risponde { accessToken, refreshToken, user }
Client → Salva token in localStorage/cookie
Client → Configura header Authorization: Bearer {accessToken}
```

### 2. Request Autenticata
```
Client → GET /api/v1/members (Authorization: Bearer {accessToken})
Server → Valida JWT via JwtAuthGuard
Server → Estrae userId e role dal token
Server → Verifica autorizzazioni (RolesGuard)
Server → Risponde con dati
```

### 3. Refresh Token
```
Client → accessToken scaduto (401)
Client → POST /api/v1/auth/refresh { refreshToken }
Server → Valida refreshToken
Server → Verifica hash in DB
Server → Genera nuovo accessToken
Server → Risponde { accessToken }
Client → Aggiorna token e riprova request
```

### 4. Logout
```
Client → POST /api/v1/auth/logout
Server → Invalida refreshToken in DB
Server → Risponde 200
Client → Rimuove token da storage
Client → Redirect a /login
```

---

## Autorizzazioni per Ruolo

| Funzionalità | ADMIN | SEGRETERIA | ALLENATORE | ATLETA |
|---|---|---|---|---|
| Gestione utenti | ✓ | ✓ | - | - |
| Gestione atleti | ✓ | ✓ | Sola lettura | Proprio profilo |
| Creazione allenamenti | ✓ | ✓ | ✓ | - |
| Gestione presenze | ✓ | ✓ | ✓ | - |
| Visualizzazione presenze | ✓ | ✓ | ✓ | Proprie |
| Gestione barche | ✓ | ✓ | Sola lettura | Sola lettura |
| Registrazione utilizzo barche | ✓ | ✓ | ✓ | - |
| Gestione gare | ✓ | ✓ | Sola lettura | Sola lettura |
| Iscrizione gare | ✓ | ✓ | - | - |
| Gestione pagamenti | ✓ | ✓ | - | Propri |

---

## Validazioni Importanti

### Backend (DTO + Prisma)
```typescript
// Esempio: CreateMemberDto
export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @Matches(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/)
  fiscalCode: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEmail()
  email: string;

  @IsEnum(MembershipType)
  membershipType: MembershipType;
}
```

### Frontend (Vuetify + custom validators)
```typescript
// utils/validators.ts
export const fiscalCodeRule = (v: string) => {
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  return regex.test(v) || 'Codice fiscale non valido';
};

export const emailRule = (v: string) => {
  return /.+@.+\..+/.test(v) || 'Email non valida';
};
```

---

## Considerazioni Tecniche

### Perché NestJS?
- Architettura modulare nativa (dependency injection)
- Decoratori per validazione, guards, interceptors
- Ottima integrazione con Prisma
- Facilita testing e manutenzione
- Scalabile per future espansioni

### Perché Prisma?
- Type-safe: genera client TypeScript da schema
- Migration automatiche e semplici
- Ottimo supporto PostgreSQL (relazioni, JSONB)
- Developer experience eccellente
- Introspection e studio schema

### Perché Vuetify 3?
- Componenti completi per gestionali (DataTable, Forms, Dialogs)
- Material Design coerente
- Responsive by default
- Buona documentazione
- Temi personalizzabili

### Database Design
- Relazioni normalizzate (3NF)
- Foreign key con CASCADE/RESTRICT appropriati
- Index su campi ricercati (email, fiscalCode, date)
- JSONB solo per dati dinamici (se necessario in futuro)
- Soft delete tramite `isActive` dove opportuno

---

## Prossimi Step

1. **Setup Progetti**
   - Inizializzazione backend (NestJS + Prisma)
   - Inizializzazione frontend (Vue 3 + Vuetify)
   - Configurazione database PostgreSQL

2. **Implementazione Auth Module**
   - Schema User in Prisma
   - JWT strategy + Refresh
   - Guards e decoratori
   - Login/logout frontend

3. **Implementazione Members Module**
   - Schema Member + MedicalCertificate
   - CRUD API
   - UI lista e form

4. **Implementazione altri moduli** (trainings → equipment → races → billing)

5. **Testing e Refinement**

---

Vuoi che proceda con la creazione della struttura dei progetti o hai domande/modifiche sull'architettura?
