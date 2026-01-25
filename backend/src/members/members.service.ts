import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMembersDto } from './dto/query-members.dto';
import { getCategoryByAge } from '../common/utils/category.utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createMemberDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if fiscal code already exists
    const existingMember = await this.prisma.member.findUnique({
      where: { fiscalCode: createMemberDto.fiscalCode },
    });

    if (existingMember) {
      throw new ConflictException('Fiscal code already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);

    // Create user with member profile
    const user = await this.prisma.user.create({
      data: {
        username: createMemberDto.username,
        email: createMemberDto.email,
        password: hashedPassword,
        roles: createMemberDto.roles || ['ATLETA'],
        member: {
          create: {
            firstName: createMemberDto.firstName,
            lastName: createMemberDto.lastName,
            fiscalCode: createMemberDto.fiscalCode,
            dateOfBirth: new Date(createMemberDto.dateOfBirth),
            placeOfBirth: createMemberDto.placeOfBirth,
            address: createMemberDto.address,
            city: createMemberDto.city,
            postalCode: createMemberDto.postalCode,
            phone: createMemberDto.phone,
            groupId: createMemberDto.groupId,
            medicalCertExpiry: createMemberDto.medicalCertExpiry ? new Date(createMemberDto.medicalCertExpiry) : null,
          },
        },
      },
      include: {
        member: {
          include: {
            medicalCert: true,
          },
        },
      },
    });

    // Exclude password from response
    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  async findAll(query: QueryMembersDto) {
    const { page = 1, limit = 10, search, isActive, category } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fiscalCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with pagination
    let [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              roles: true,
              isActive: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          medicalCert: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      this.prisma.member.count({ where }),
    ]);

    // Filter by category if specified (client-side filtering since category is calculated)
    if (category) {
      members = members.filter((member) => {
        const memberCategory = getCategoryByAge(member.dateOfBirth);
        return memberCategory === category;
      });
      total = members.length;
    }

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: true,
            isActive: true,
            createdAt: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        medicalCert: true,
        attendances: {
          include: {
            training: {
              select: {
                id: true,
                name: true,
                date: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        raceParticipations: {
          include: {
            race: {
              select: {
                id: true,
                name: true,
                date: true,
                location: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    // Check if member exists
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // If username is being updated, check for conflicts
    if (updateMemberDto.username && updateMemberDto.username !== existingMember.user.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateMemberDto.username },
      });

      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
    }

    // If fiscal code is being updated, check for conflicts
    if (updateMemberDto.fiscalCode && updateMemberDto.fiscalCode !== existingMember.fiscalCode) {
      const fiscalCodeExists = await this.prisma.member.findUnique({
        where: { fiscalCode: updateMemberDto.fiscalCode },
      });

      if (fiscalCodeExists) {
        throw new ConflictException('Fiscal code already exists');
      }
    }

    // Prepare update data
    const userUpdateData: any = {};
    const memberUpdateData: any = {};

    if (updateMemberDto.username) userUpdateData.username = updateMemberDto.username;
    if (updateMemberDto.email !== undefined) userUpdateData.email = updateMemberDto.email;
    if (updateMemberDto.roles) userUpdateData.roles = updateMemberDto.roles;
    if (updateMemberDto.password) {
      userUpdateData.password = await bcrypt.hash(updateMemberDto.password, 10);
    }

    if (updateMemberDto.firstName) memberUpdateData.firstName = updateMemberDto.firstName;
    if (updateMemberDto.lastName) memberUpdateData.lastName = updateMemberDto.lastName;
    if (updateMemberDto.fiscalCode) memberUpdateData.fiscalCode = updateMemberDto.fiscalCode;
    if (updateMemberDto.dateOfBirth) memberUpdateData.dateOfBirth = new Date(updateMemberDto.dateOfBirth);
    if (updateMemberDto.placeOfBirth) memberUpdateData.placeOfBirth = updateMemberDto.placeOfBirth;
    if (updateMemberDto.address) memberUpdateData.address = updateMemberDto.address;
    if (updateMemberDto.city) memberUpdateData.city = updateMemberDto.city;
    if (updateMemberDto.postalCode) memberUpdateData.postalCode = updateMemberDto.postalCode;
    if (updateMemberDto.phone !== undefined) memberUpdateData.phone = updateMemberDto.phone;
    // Handle groupId as a relation
    if (updateMemberDto.groupId !== undefined) {
      if (updateMemberDto.groupId) {
        memberUpdateData.group = { connect: { id: updateMemberDto.groupId } };
      } else {
        memberUpdateData.group = { disconnect: true };
      }
    }
    if (updateMemberDto.medicalCertExpiry !== undefined) {
      memberUpdateData.medicalCertExpiry = updateMemberDto.medicalCertExpiry ? new Date(updateMemberDto.medicalCertExpiry) : null;
    }
    if (updateMemberDto.isActive !== undefined) memberUpdateData.isActive = updateMemberDto.isActive;

    // Update user and member
    const updatedMember = await this.prisma.member.update({
      where: { id },
      data: {
        ...memberUpdateData,
        user: {
          update: userUpdateData,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: true,
            isActive: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        medicalCert: true,
      },
    });

    return updatedMember;
  }

  async remove(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Soft delete: deactivate instead of deleting
    await this.prisma.member.update({
      where: { id },
      data: {
        isActive: false,
        user: {
          update: {
            isActive: false,
          },
        },
      },
    });

    return { message: 'Member deactivated successfully' };
  }

  async addRoles(id: string, roles: string[]) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Merge existing roles with new ones (avoiding duplicates)
    const currentRoles = member.user.roles as string[];
    const updatedRoles = Array.from(new Set([...currentRoles, ...roles])) as any;

    await this.prisma.user.update({
      where: { id: member.userId },
      data: { roles: { set: updatedRoles } },
    });

    return { message: 'Roles added successfully', roles: updatedRoles };
  }

  async removeRoles(id: string, roles: string[]) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    const currentRoles = member.user.roles as string[];
    const updatedRoles = currentRoles.filter((role) => !roles.includes(role));

    // Ensure at least ATLETA role remains
    if (updatedRoles.length === 0) {
      updatedRoles.push('ATLETA');
    }

    await this.prisma.user.update({
      where: { id: member.userId },
      data: { roles: { set: updatedRoles as any } },
    });

    return { message: 'Roles removed successfully', roles: updatedRoles };
  }
}
