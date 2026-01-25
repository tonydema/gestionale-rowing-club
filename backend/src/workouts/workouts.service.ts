import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkoutDto, userId: string) {
    const startDateTime = new Date(dto.startDateTime);
    const endDateTime = new Date(dto.endDateTime);

    // Crea l'allenamento principale
    const workout = await this.prisma.workout.create({
      data: {
        groupId: dto.groupId,
        notes: dto.notes,
        startDateTime,
        endDateTime,
        type: dto.type as any,
        distance: dto.distance,
        repetitions: dto.repetitions,
        weightDescription: dto.weightDescription,
        createdById: userId,
      },
      include: {
        group: true,
        createdBy: {
          include: {
            member: true,
          },
        },
      },
    });

    // Duplica l'allenamento per le settimane successive se richiesto
    if (dto.duplicateWeeks && dto.duplicateWeeks > 0) {
      const duplicates = [];
      for (let week = 1; week <= dto.duplicateWeeks; week++) {
        const weekOffset = week * 7 * 24 * 60 * 60 * 1000; // millisecondi in una settimana
        duplicates.push({
          groupId: dto.groupId,
          notes: dto.notes,
          startDateTime: new Date(startDateTime.getTime() + weekOffset),
          endDateTime: new Date(endDateTime.getTime() + weekOffset),
          type: dto.type as any,
          distance: dto.distance,
          repetitions: dto.repetitions,
          weightDescription: dto.weightDescription,
          createdById: userId,
        });
      }

      await this.prisma.workout.createMany({
        data: duplicates,
      });
    }

    return workout;
  }

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.groupId) where.groupId = filters.groupId;
    if (filters?.type) where.type = filters.type;
    if (filters?.startDate) {
      where.startDateTime = { ...where.startDateTime, gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      where.startDateTime = { ...where.startDateTime, lte: new Date(filters.endDate) };
    }

    const page = filters?.page ? parseInt(filters.page, 10) : 1;
    const limit = filters?.limit ? parseInt(filters.limit, 10) : 100;

    const [data, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        include: {
          group: true,
          createdBy: {
            include: {
              member: true,
            },
          },
        },
        orderBy: { startDateTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workout.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return this.prisma.workout.findUnique({
      where: { id },
      include: {
        group: true,
        createdBy: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateWorkoutDto) {
    const updateData: any = {};
    if (dto.groupId) updateData.groupId = dto.groupId;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.startDateTime) updateData.startDateTime = new Date(dto.startDateTime);
    if (dto.endDateTime) updateData.endDateTime = new Date(dto.endDateTime);
    if (dto.type) updateData.type = dto.type;
    if (dto.distance !== undefined) updateData.distance = dto.distance;
    if (dto.repetitions !== undefined) updateData.repetitions = dto.repetitions;
    if (dto.weightDescription !== undefined) updateData.weightDescription = dto.weightDescription;

    return this.prisma.workout.update({
      where: { id },
      data: updateData,
      include: {
        group: true,
        createdBy: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.prisma.workout.delete({ where: { id } });
  }
}
