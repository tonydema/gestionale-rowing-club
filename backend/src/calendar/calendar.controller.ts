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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SEGRETERIA, Role.ALLENATORE)
  @ApiOperation({ summary: 'Crea nuovo evento calendario' })
  @ApiResponse({ status: 201, description: 'Evento creato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.calendarService.create(createEventDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti gli eventi con filtri opzionali' })
  @ApiResponse({ status: 200, description: 'Lista eventi' })
  findAll(@Query() query: QueryEventsDto) {
    return this.calendarService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni evento per ID' })
  @ApiResponse({ status: 200, description: 'Dettaglio evento' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SEGRETERIA, Role.ALLENATORE)
  @ApiOperation({ summary: 'Aggiorna evento' })
  @ApiResponse({ status: 200, description: 'Evento aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.calendarService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SEGRETERIA, Role.ALLENATORE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Elimina evento' })
  @ApiResponse({ status: 200, description: 'Evento eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
}
