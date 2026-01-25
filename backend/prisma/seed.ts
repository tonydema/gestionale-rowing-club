import { PrismaClient, Role, BoatType, BoatStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Create Groups
  const groupAgonisti = await prisma.group.upsert({
    where: { name: 'Gruppo Agonisti' },
    update: {},
    create: {
      name: 'Gruppo Agonisti',
    },
  });
  console.log('✅ Group created:', groupAgonisti.name);

  const groupGiovani = await prisma.group.upsert({
    where: { name: 'Gruppo Giovani' },
    update: {},
    create: {
      name: 'Gruppo Giovani',
    },
  });
  console.log('✅ Group created:', groupGiovani.name);

  const groupMaster = await prisma.group.upsert({
    where: { name: 'Gruppo Master' },
    update: {},
    create: {
      name: 'Gruppo Master',
    },
  });
  console.log('✅ Group created:', groupMaster.name);

  // 1. Crea utente ADMIN
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@canottaggio.it',
      password: hashedPassword,
      roles: [Role.ADMIN, Role.ATLETA],
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', adminUser.username);

  // 2. Crea utente SEGRETERIA
  const secretaryUser = await prisma.user.upsert({
    where: { username: 'segreteria' },
    update: {},
    create: {
      username: 'segreteria',
      email: 'segreteria@canottaggio.it',
      password: hashedPassword,
      roles: [Role.SEGRETERIA, Role.ATLETA],
      isActive: true,
    },
  });
  console.log('✅ Secretary user created:', secretaryUser.username);

  // 3. Crea utente ALLENATORE + ATLETA con profilo atleta (44 anni - Senior/Master)
  const coachUser = await prisma.user.upsert({
    where: { username: 'mrossi' },
    update: {},
    create: {
      username: 'mrossi',
      email: 'mrossi@canottaggio.it',
      password: hashedPassword,
      roles: [Role.ALLENATORE, Role.ATLETA],
      isActive: true,
      member: {
        create: {
          firstName: 'Marco',
          lastName: 'Rossi',
          fiscalCode: 'RSSMRC80A01H501Z',
          dateOfBirth: new Date('1980-01-01'), // 44 anni - Senior/Master
          placeOfBirth: 'Roma',
          address: 'Via Roma 1',
          city: 'Roma',
          postalCode: '00100',
          phone: '3331234567',
          groupId: groupMaster.id,
          medicalCertExpiry: new Date('2025-12-31'),
          medicalCert: {
            create: {
              issueDate: new Date('2024-01-01'),
              expiryDate: new Date('2025-01-01'),
              certType: 'Agonistico',
              doctorName: 'Dr. Bianchi',
            },
          },
        },
      },
    },
  });
  console.log('✅ Coach user created:', coachUser.username);

  // 4. Crea atleta 1 (29 anni - Senior)
  const athleteUser1 = await prisma.user.upsert({
    where: { username: 'lverdi' },
    update: {},
    create: {
      username: 'lverdi',
      email: 'lverdi@canottaggio.it',
      password: hashedPassword,
      roles: [Role.ATLETA],
      isActive: true,
      member: {
        create: {
          firstName: 'Luca',
          lastName: 'Verdi',
          fiscalCode: 'VRDLCU95M15H501A',
          dateOfBirth: new Date('1995-08-15'), // 29 anni - Senior/Master
          placeOfBirth: 'Milano',
          address: 'Via Milano 10',
          city: 'Milano',
          postalCode: '20100',
          phone: '3337654321',
          groupId: groupAgonisti.id,
          medicalCertExpiry: new Date('2025-06-01'),
          medicalCert: {
            create: {
              issueDate: new Date('2024-06-01'),
              expiryDate: new Date('2025-06-01'),
              certType: 'Agonistico',
              doctorName: 'Dr. Neri',
            },
          },
        },
      },
    },
  });
  console.log('✅ Athlete 1 created:', athleteUser1.username);

  // 5. Crea atleta 2 (26 anni - Senior)
  const athleteUser2 = await prisma.user.upsert({
    where: { username: 'sbianchi' },
    update: {},
    create: {
      username: 'sbianchi',
      email: 'sbianchi@canottaggio.it',
      password: hashedPassword,
      roles: [Role.ATLETA],
      isActive: true,
      member: {
        create: {
          firstName: 'Sara',
          lastName: 'Bianchi',
          fiscalCode: 'BNCSRA98D45F205B',
          dateOfBirth: new Date('1998-04-05'), // 26 anni - Senior
          placeOfBirth: 'Torino',
          address: 'Corso Torino 25',
          city: 'Torino',
          postalCode: '10100',
          phone: '3345678901',
          groupId: groupAgonisti.id,
          medicalCertExpiry: new Date('2025-03-15'),
          medicalCert: {
            create: {
              issueDate: new Date('2024-03-15'),
              expiryDate: new Date('2025-03-15'),
              certType: 'Agonistico',
              doctorName: 'Dr. Rossi',
            },
          },
        },
      },
    },
  });
  console.log('✅ Athlete 2 created:', athleteUser2.username);

  // 6. Crea atleta 3 - giovane (15 anni - Under 17)
  const athleteUser3 = await prisma.user.upsert({
    where: { username: 'gferrari' },
    update: {},
    create: {
      username: 'gferrari',
      email: 'genitore@example.com', // Email del genitore condivisa
      password: hashedPassword,
      roles: [Role.ATLETA],
      isActive: true,
      member: {
        create: {
          firstName: 'Giovanni',
          lastName: 'Ferrari',
          fiscalCode: 'FRRGNN09B12H501C',
          dateOfBirth: new Date('2009-02-12'), // 15 anni - Under 17
          placeOfBirth: 'Firenze',
          address: 'Via Firenze 5',
          city: 'Firenze',
          postalCode: '50100',
          groupId: groupGiovani.id,
          medicalCertExpiry: new Date('2025-08-30'),
        },
      },
    },
  });
  console.log('✅ Athlete 3 created:', athleteUser3.username);

  // 7. Crea atleta 4 - giovane (12 anni - Allievi B) - stessa email genitore
  const athleteUser4 = await prisma.user.upsert({
    where: { username: 'mferrari' },
    update: {},
    create: {
      username: 'mferrari',
      email: 'genitore@example.com', // Email del genitore condivisa con fratello
      password: hashedPassword,
      roles: [Role.ATLETA],
      isActive: true,
      member: {
        create: {
          firstName: 'Maria',
          lastName: 'Ferrari',
          fiscalCode: 'FRRMRA12D52H501D',
          dateOfBirth: new Date('2012-04-22'), // 12 anni - Allievi B
          placeOfBirth: 'Firenze',
          address: 'Via Firenze 5',
          city: 'Firenze',
          postalCode: '50100',
          groupId: groupGiovani.id,
          medicalCertExpiry: new Date('2025-09-15'),
        },
      },
    },
  });
  console.log('✅ Athlete 4 created:', athleteUser4.username);

  // 8. Crea alcune barche
  const boat1 = await prisma.boat.create({
    data: {
      name: 'Freccia Azzurra',
      type: BoatType.SINGOLO,
      seats: 1,
      brand: 'Filippi',
      model: 'F10',
      status: BoatStatus.DISPONIBILE,
      condition: 'Ottime condizioni',
      purchaseDate: new Date('2022-01-15'),
      purchasePrice: 8500.00,
    },
  });
  console.log('✅ Boat created:', boat1.name);

  const boat2 = await prisma.boat.create({
    data: {
      name: 'Stella Marina',
      type: BoatType.DOPPIO,
      seats: 2,
      brand: 'Empacher',
      model: '2x',
      status: BoatStatus.DISPONIBILE,
      condition: 'Buone condizioni',
      purchaseDate: new Date('2021-06-10'),
      purchasePrice: 15000.00,
    },
  });
  console.log('✅ Boat created:', boat2.name);

  const boat3 = await prisma.boat.create({
    data: {
      name: 'Vento del Nord',
      type: BoatType.QUATTRO_SENZA,
      seats: 4,
      brand: 'Filippi',
      model: '4-',
      status: BoatStatus.DISPONIBILE,
      condition: 'Ottime condizioni',
      purchaseDate: new Date('2023-03-20'),
      purchasePrice: 22000.00,
    },
  });
  console.log('✅ Boat created:', boat3.name);

  // 9. Crea un allenamento
  const training = await prisma.training.create({
    data: {
      name: 'Allenamento Tecnico',
      description: 'Allenamento focalizzato sulla tecnica di voga',
      date: new Date(),
      startTime: new Date(new Date().setHours(17, 0, 0, 0)),
      endTime: new Date(new Date().setHours(19, 0, 0, 0)),
      location: 'Sede',
      coachId: coachUser.id,
      maxParticipants: 10,
    },
  });
  console.log('✅ Training created:', training.name);

  // 10. Crea una gara
  const race = await prisma.race.create({
    data: {
      name: 'Campionato Regionale 2025',
      location: 'Lago di Como',
      date: new Date('2025-06-15'),
      category: 'Regionali',
      description: 'Gara valida per il campionato regionale',
      registrationDeadline: new Date('2025-06-01'),
    },
  });
  console.log('✅ Race created:', race.name);

  console.log('');
  console.log('✅ Seeding completed!');
  console.log('');
  console.log('📋 Default users (username / password):');
  console.log('   Admin: admin / Admin123!');
  console.log('   Segreteria: segreteria / Admin123!');
  console.log('   Allenatore: mrossi / Admin123! (Marco Rossi, 44 anni - Senior/Master)');
  console.log('   Atleta 1: lverdi / Admin123! (Luca Verdi, 29 anni - Senior/Master)');
  console.log('   Atleta 2: sbianchi / Admin123! (Sara Bianchi, 26 anni - Senior)');
  console.log('   Atleta 3: gferrari / Admin123! (Giovanni Ferrari, 15 anni - Under 17)');
  console.log('   Atleta 4: mferrari / Admin123! (Maria Ferrari, 12 anni - Allievi B)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
