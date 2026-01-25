import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reporting')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post()
  @Roles('ADMIN', 'SEGRETERIA', 'ALLENATORE')
  @ApiOperation({ summary: 'Crea una nuova rendicontazione' })
  create(@CurrentUser() user: any, @Body() createReportDto: CreateReportDto) {
    return this.reportingService.create(user.id, user.roles, createReportDto);
  }

  @Get()
  @Roles('ADMIN', 'SEGRETERIA', 'ALLENATORE')
  @ApiOperation({ summary: 'Ottiene la lista delle rendicontazioni' })
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.reportingService.findAll(user.id, user.roles, query);
  }

  @Get(':id')
  @Roles('ADMIN', 'SEGRETERIA', 'ALLENATORE')
  @ApiOperation({ summary: 'Ottiene una rendicontazione per ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportingService.findOne(id, user.id, user.roles);
  }

  @Put(':id')
  @Roles('ADMIN', 'SEGRETERIA', 'ALLENATORE')
  @ApiOperation({ summary: 'Aggiorna una rendicontazione' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportingService.update(id, user.id, user.roles, updateReportDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SEGRETERIA')
  @ApiOperation({ summary: 'Elimina una rendicontazione' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportingService.remove(id, user.id, user.roles);
  }
}
