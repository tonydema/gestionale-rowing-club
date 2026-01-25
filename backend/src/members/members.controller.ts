import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMembersDto } from './dto/query-members.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SEGRETERIA)
  @ApiOperation({ summary: 'Create new member' })
  @ApiResponse({ status: 201, description: 'Member created successfully' })
  @ApiResponse({ status: 409, description: 'Email or fiscal code already exists' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SEGRETERIA, Role.ALLENATORE)
  @ApiOperation({ summary: 'Get all members with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of members' })
  findAll(@Query() query: QueryMembersDto) {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SEGRETERIA, Role.ALLENATORE)
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiResponse({ status: 200, description: 'Member details' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SEGRETERIA)
  @ApiOperation({ summary: 'Update member' })
  @ApiResponse({ status: 200, description: 'Member updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Email or fiscal code already exists' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate member (soft delete)' })
  @ApiResponse({ status: 200, description: 'Member deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Post(':id/roles/add')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add roles to member' })
  @ApiResponse({ status: 200, description: 'Roles added successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  addRoles(@Param('id') id: string, @Body() body: { roles: string[] }) {
    return this.membersService.addRoles(id, body.roles);
  }

  @Post(':id/roles/remove')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove roles from member' })
  @ApiResponse({ status: 200, description: 'Roles removed successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  removeRoles(@Param('id') id: string, @Body() body: { roles: string[] }) {
    return this.membersService.removeRoles(id, body.roles);
  }
}
