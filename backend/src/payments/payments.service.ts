import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        title: dto.title,
        type: dto.type as any,
        quantity: dto.quantity,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        transactionType: dto.transactionType as any,
        amount: dto.amount,
        isPaid: dto.isPaid,
        coachId: dto.coachId,
        date: new Date(dto.date),
        notes: dto.notes,
      },
      include: { coach: { include: { member: true } } },
    });
  }

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.transactionType) where.transactionType = filters.transactionType;
    if (filters?.isPaid !== undefined) where.isPaid = filters.isPaid === 'true';
    if (filters?.coachId) where.coachId = filters.coachId;
    if (filters?.startDate) where.date = { ...where.date, gte: new Date(filters.startDate) };
    if (filters?.endDate) where.date = { ...where.date, lte: new Date(filters.endDate) };

    const page = filters?.page ? parseInt(filters.page, 10) : 1;
    const limit = filters?.limit ? parseInt(filters.limit, 10) : 10;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { coach: { include: { member: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { coach: { include: { member: true } } },
    });
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.type) updateData.type = dto.type;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.transactionType) updateData.transactionType = dto.transactionType;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.isPaid !== undefined) updateData.isPaid = dto.isPaid;
    if (dto.coachId !== undefined) updateData.coachId = dto.coachId;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: { coach: { include: { member: true } } },
    });
  }

  async remove(id: string) {
    await this.prisma.payment.delete({ where: { id } });
  }
}
