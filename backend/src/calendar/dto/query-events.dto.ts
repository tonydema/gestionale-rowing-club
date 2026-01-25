import { ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarEventType } from '@prisma/client';
import { IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';

export class QueryEventsDto {
  @ApiPropertyOptional({
    enum: CalendarEventType,
    isArray: true,
    description: 'Filtro per tipologie evento',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CalendarEventType, { each: true })
  types?: CalendarEventType[];

  @ApiPropertyOptional({ description: 'Data inizio range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data fine range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
