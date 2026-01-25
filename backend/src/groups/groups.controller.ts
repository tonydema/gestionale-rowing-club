import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SEGRETERIA)
  @ApiOperation({ summary: 'Crea nuovo gruppo' })
  @ApiResponse({ status: 201, description: 'Gruppo creato con successo' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista tutti i gruppi' })
  @ApiResponse({ status: 200, description: 'Lista gruppi recuperata' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettagli gruppo con membri' })
  @ApiResponse({ status: 200, description: 'Gruppo trovato' })
  @ApiResponse({ status: 404, description: 'Gruppo non trovato' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SEGRETERIA)
  @ApiOperation({ summary: 'Aggiorna gruppo' })
  @ApiResponse({ status: 200, description: 'Gruppo aggiornato' })
  @ApiResponse({ status: 404, description: 'Gruppo non trovato' })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SEGRETERIA)
  @ApiOperation({ summary: 'Elimina gruppo' })
  @ApiResponse({ status: 200, description: 'Gruppo eliminato' })
  @ApiResponse({ status: 404, description: 'Gruppo non trovato' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
