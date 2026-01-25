import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { CalendarEventType, Role } from '@prisma/client';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, createdById: string) {
    const { participantIds, coachIds, ...eventData } = createEventDto;

    // Validazioni specifiche per tipo evento
    await this.validateEventByType(
      createEventDto.type,
      participantIds,
      coachIds,
    );

    // Crea evento con relazioni
    const event = await this.prisma.calendarEvent.create({
      data: {
        ...eventData,
        startDateTime: new Date(eventData.startDateTime),
        endDateTime: new Date(eventData.endDateTime),
        createdById,
        participants: participantIds
          ? {
              create: participantIds.map((userId) => ({ userId })),
            }
          : undefined,
        coaches: coachIds
          ? {
              create: coachIds.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        coaches: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return event;
  }

  async findAll(query: QueryEventsDto) {
    const { types, startDate, endDate } = query;

    const where: any = {};

    if (types && types.length > 0) {
      where.type = { in: types };
    }

    if (startDate || endDate) {
      where.startDateTime = {};
      if (startDate) {
        where.startDateTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startDateTime.lte = new Date(endDate);
      }
    }

    const events = await this.prisma.calendarEvent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        coaches: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return events;
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        coaches: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id); // Verifica esistenza

    const { participantIds, coachIds, ...eventData } = updateEventDto;

    // Se ci sono modifiche ai partecipanti o coaches, aggiorna le relazioni
    const updateData: any = {
      ...eventData,
    };

    if (eventData.startDateTime) {
      updateData.startDateTime = new Date(eventData.startDateTime);
    }
    if (eventData.endDateTime) {
      updateData.endDateTime = new Date(eventData.endDateTime);
    }

    if (participantIds !== undefined) {
      // Rimuovi partecipanti esistenti e ricrea
      await this.prisma.eventParticipant.deleteMany({
        where: { eventId: id },
      });
      updateData.participants = {
        create: participantIds.map((userId) => ({ userId })),
      };
    }

    if (coachIds !== undefined) {
      // Rimuovi coaches esistenti e ricrea
      await this.prisma.eventCoach.deleteMany({
        where: { eventId: id },
      });
      updateData.coaches = {
        create: coachIds.map((userId) => ({ userId })),
      };
    }

    const event = await this.prisma.calendarEvent.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        coaches: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return event;
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica esistenza

    await this.prisma.calendarEvent.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  // Validazioni specifiche per tipo evento
  private async validateEventByType(
    type: CalendarEventType,
    participantIds?: string[],
    coachIds?: string[],
  ) {
    switch (type) {
      case CalendarEventType.DISPONIBILITA_ALLENATORE:
        // Deve avere almeno un coach
        if (!coachIds || coachIds.length === 0) {
          throw new BadRequestException(
            'Disponibilità allenatore richiede almeno un allenatore',
          );
        }
        // Verifica che siano allenatori
        await this.validateCoaches(coachIds);
        break;

      case CalendarEventType.LEZIONE_SINGOLA:
        // Deve avere esattamente 1 partecipante e almeno 1 coach
        if (!participantIds || participantIds.length !== 1) {
          throw new BadRequestException(
            'Lezione singola richiede esattamente un partecipante',
          );
        }
        if (!coachIds || coachIds.length === 0) {
          throw new BadRequestException(
            'Lezione singola richiede almeno un istruttore',
          );
        }
        await this.validateActiveAthletes(participantIds);
        await this.validateCoaches(coachIds);
        break;

      case CalendarEventType.LEZIONE_GRUPPO:
        // Deve avere almeno 1 partecipante e almeno 1 coach
        if (!participantIds || participantIds.length === 0) {
          throw new BadRequestException(
            'Lezione di gruppo richiede almeno un partecipante',
          );
        }
        if (!coachIds || coachIds.length === 0) {
          throw new BadRequestException(
            'Lezione di gruppo richiede almeno un istruttore',
          );
        }
        await this.validateActiveAthletes(participantIds);
        await this.validateCoaches(coachIds);
        break;

      case CalendarEventType.GARA:
        // Deve avere almeno 1 partecipante
        if (!participantIds || participantIds.length === 0) {
          throw new BadRequestException(
            'Gara richiede almeno un partecipante',
          );
        }
        await this.validateActiveAthletes(participantIds);
        break;

      case CalendarEventType.EVENTO_GENERICO:
        // Opzionale per evento generico
        if (participantIds && participantIds.length > 0) {
          await this.validateActiveAthletes(participantIds);
        }
        break;

      default:
        throw new BadRequestException('Tipologia evento non valida');
    }
  }

  // Verifica che gli utenti siano allenatori
  private async validateCoaches(userIds: string[]) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        roles: true,
      },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('Alcuni utenti non esistono');
    }

    const invalidCoaches = users.filter(
      (user) => !user.roles.includes(Role.ALLENATORE),
    );

    if (invalidCoaches.length > 0) {
      throw new BadRequestException(
        'Alcuni utenti selezionati non hanno il ruolo di allenatore',
      );
    }
  }

  // Verifica che gli utenti siano atleti attivi
  private async validateActiveAthletes(userIds: string[]) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        roles: true,
        isActive: true,
        member: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('Alcuni utenti non esistono');
    }

    const invalidAthletes = users.filter(
      (user) =>
        !user.roles.includes(Role.ATLETA) ||
        !user.isActive ||
        !user.member?.isActive,
    );

    if (invalidAthletes.length > 0) {
      throw new BadRequestException(
        'Alcuni utenti selezionati non sono atleti attivi',
      );
    }
  }
}
