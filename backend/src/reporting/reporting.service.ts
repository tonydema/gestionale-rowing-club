import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, userRoles: string[], dto: CreateReportDto) {
    // Determina il coachId
    let coachId = dto.coachId;

    // Se è admin o segreteria, usa il coachId fornito
    // Se è allenatore, usa il suo ID
    if (!userRoles.includes('ADMIN') && !userRoles.includes('SEGRETERIA')) {
      coachId = userId;
    }

    if (!coachId) {
      throw new ForbiddenException('Coach ID è richiesto');
    }

    // Crea il report
    const report = await this.prisma.report.create({
      data: {
        description: dto.description,
        date: new Date(dto.date),
        reportTypeId: dto.reportTypeId || null,
        compensation: dto.compensation,
        coachId,
      },
      include: {
        coach: {
          include: {
            member: true,
          },
        },
        reportType: true,
        athletes: {
          include: {
            member: true,
          },
        },
      },
    });

    // Aggiungi gli atleti se forniti
    if (dto.athleteIds && dto.athleteIds.length > 0) {
      await this.prisma.reportAthlete.createMany({
        data: dto.athleteIds.map((memberId) => ({
          reportId: report.id,
          memberId,
        })),
      });

      // Ricarica con gli atleti
      return this.findOne(report.id, userId, userRoles);
    }

    return report;
  }

  async findAll(userId: string, userRoles: string[], filters?: any) {
    const where: any = {};

    // Se è allenatore (non admin/segreteria), vede solo le sue
    if (!userRoles.includes('ADMIN') && !userRoles.includes('SEGRETERIA')) {
      where.coachId = userId;
    } else {
      // Admin/segreteria possono filtrare per coach
      if (filters?.coachId) {
        where.coachId = filters.coachId;
      }
    }

    if (filters?.reportTypeId) {
      where.reportTypeId = filters.reportTypeId;
    }

    if (filters?.startDate) {
      where.date = { ...where.date, gte: new Date(filters.startDate) };
    }

    if (filters?.endDate) {
      where.date = { ...where.date, lte: new Date(filters.endDate) };
    }

    // Parse page e limit come numeri
    const page = filters?.page ? parseInt(filters.page, 10) : 1;
    const limit = filters?.limit ? parseInt(filters.limit, 10) : 10;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          coach: {
            include: {
              member: true,
            },
          },
          reportType: true,
          athletes: {
            include: {
              member: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string, userRoles: string[]) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        coach: {
          include: {
            member: true,
          },
        },
        reportType: true,
        athletes: {
          include: {
            member: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report non trovato');
    }

    // Allenatore può vedere solo le sue
    if (!userRoles.includes('ADMIN') && !userRoles.includes('SEGRETERIA')) {
      if (report.coachId !== userId) {
        throw new ForbiddenException('Non hai i permessi per visualizzare questo report');
      }
    }

    return report;
  }

  async update(id: string, userId: string, userRoles: string[], dto: UpdateReportDto) {
    const report = await this.findOne(id, userId, userRoles);

    // Allenatore può modificare solo le sue
    if (!userRoles.includes('ADMIN') && !userRoles.includes('SEGRETERIA')) {
      if (report.coachId !== userId) {
        throw new ForbiddenException('Non hai i permessi per modificare questo report');
      }
    }

    const updateData: any = {};
    if (dto.description) updateData.description = dto.description;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.reportTypeId !== undefined) updateData.reportTypeId = dto.reportTypeId || null;
    if (dto.compensation !== undefined) updateData.compensation = dto.compensation;

    // Solo admin/segreteria possono cambiare coach
    if (dto.coachId && (userRoles.includes('ADMIN') || userRoles.includes('SEGRETERIA'))) {
      updateData.coachId = dto.coachId;
    }

    // Aggiorna il report
    await this.prisma.report.update({
      where: { id },
      data: updateData,
    });

    // Gestisci gli atleti se forniti
    if (dto.athleteIds !== undefined) {
      // Rimuovi tutti gli atleti esistenti
      await this.prisma.reportAthlete.deleteMany({
        where: { reportId: id },
      });

      // Aggiungi i nuovi atleti
      if (dto.athleteIds.length > 0) {
        await this.prisma.reportAthlete.createMany({
          data: dto.athleteIds.map((memberId) => ({
            reportId: id,
            memberId,
          })),
        });
      }
    }

    return this.findOne(id, userId, userRoles);
  }

  async remove(id: string, userId: string, userRoles: string[]) {
    const report = await this.findOne(id, userId, userRoles);

    // Solo admin/segreteria possono eliminare
    if (!userRoles.includes('ADMIN') && !userRoles.includes('SEGRETERIA')) {
      throw new ForbiddenException('Non hai i permessi per eliminare questo report');
    }

    await this.prisma.report.delete({ where: { id } });
  }
}
