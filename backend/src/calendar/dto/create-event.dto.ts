import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarEventType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ enum: CalendarEventType, description: 'Tipologia evento' })
  @IsEnum(CalendarEventType)
  type: CalendarEventType;

  @ApiProperty({ description: 'Titolo evento' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Descrizione evento' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Note aggiuntive' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Data e ora inizio (ISO 8601)' })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({ description: 'Data e ora fine (ISO 8601)' })
  @IsDateString()
  endDateTime: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array di user IDs partecipanti',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Array di user IDs allenatori/istruttori',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  coachIds?: string[];
}
