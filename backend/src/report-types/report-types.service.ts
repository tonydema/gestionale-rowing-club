import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { UpdateReportTypeDto } from './dto/update-report-type.dto';

@Injectable()
export class ReportTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReportTypeDto) {
    // Verifica unicità nome
    const existing = await this.prisma.reportTypeConfig.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Esiste già una tipologia con questo nome');
    }

    return this.prisma.reportTypeConfig.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isEnabled: dto.isEnabled ?? true,
      },
    });
  }

  async findAll(onlyEnabled?: boolean) {
    const where: any = {};
    if (onlyEnabled) {
      where.isEnabled = true;
    }

    return this.prisma.reportTypeConfig.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const reportType = await this.prisma.reportTypeConfig.findUnique({
      where: { id },
    });

    if (!reportType) {
      throw new NotFoundException('Tipologia non trovata');
    }

    return reportType;
  }

  async update(id: string, dto: UpdateReportTypeDto) {
    await this.findOne(id);

    // Se cambia il nome, verifica unicità
    if (dto.name) {
      const existing = await this.prisma.reportTypeConfig.findFirst({
        where: {
          name: dto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Esiste già una tipologia con questo nome');
      }
    }

    return this.prisma.reportTypeConfig.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isEnabled: dto.isEnabled,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verifica se ci sono report collegati
    const reportsCount = await this.prisma.report.count({
      where: { reportTypeId: id },
    });

    if (reportsCount > 0) {
      throw new ConflictException(
        `Impossibile eliminare: ${reportsCount} rendicontazioni usano questa tipologia`,
      );
    }

    await this.prisma.reportTypeConfig.delete({ where: { id } });
  }
}
