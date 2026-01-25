import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: createGroupDto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.group.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fiscalCode: true,
            phone: true,
            isActive: true,
          },
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Gruppo con ID ${id} non trovato`);
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      return await this.prisma.group.update({
        where: { id },
        data: {
          name: updateGroupDto.name,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Gruppo con ID ${id} non trovato`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.group.delete({
        where: { id },
      });
      return { message: 'Gruppo eliminato con successo' };
    } catch (error) {
      throw new NotFoundException(`Gruppo con ID ${id} non trovato`);
    }
  }
}
