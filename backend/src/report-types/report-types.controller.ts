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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportTypesService } from './report-types.service';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { UpdateReportTypeDto } from './dto/update-report-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Report Types')
@ApiBearerAuth()
@Controller('report-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportTypesController {
  constructor(private readonly reportTypesService: ReportTypesService) {}

  @Post()
  @Roles('ADMIN', 'SEGRETERIA')
  @ApiOperation({ summary: 'Crea una nuova tipologia di rendicontazione' })
  create(@Body() createReportTypeDto: CreateReportTypeDto) {
    return this.reportTypesService.create(createReportTypeDto);
  }

  @Get()
  @Roles('ADMIN', 'SEGRETERIA', 'ALLENATORE')
  @ApiOperation({ summary: 'Lista tutte le tipologie' })
  @ApiQuery({ name: 'onlyEnabled', required: false, type: Boolean })
  findAll(@Query('onlyEnabled') onlyEnabled?: string) {
    return this.reportTypesService.findAll(onlyEnabled === 'true');
  }

  @Get(':id')
  @Roles('ADMIN', 'SEGRETERIA', 'ALLENATORE')
  @ApiOperation({ summary: 'Dettaglio tipologia' })
  findOne(@Param('id') id: string) {
    return this.reportTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SEGRETERIA')
  @ApiOperation({ summary: 'Modifica una tipologia' })
  update(@Param('id') id: string, @Body() updateReportTypeDto: UpdateReportTypeDto) {
    return this.reportTypesService.update(id, updateReportTypeDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SEGRETERIA')
  @ApiOperation({ summary: 'Elimina una tipologia' })
  remove(@Param('id') id: string) {
    return this.reportTypesService.remove(id);
  }
}
