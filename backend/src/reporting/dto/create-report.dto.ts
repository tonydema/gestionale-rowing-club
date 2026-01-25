import { IsString, IsDateString, IsOptional, IsNumber, IsArray, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: "Descrizione dell'attività" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Data dell'attività", example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'ID della tipologia di rendicontazione' })
  @IsOptional()
  @IsString()
  reportTypeId?: string;

  @ApiPropertyOptional({ description: 'Compenso (precompilato dalla tipologia, modificabile)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compensation?: number;

  @ApiPropertyOptional({ description: 'ID allenatore (opzionale, auto-assegnato se allenatore)' })
  @IsOptional()
  @IsString()
  coachId?: string;

  @ApiPropertyOptional({ description: 'Lista degli ID degli atleti coinvolti' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  athleteIds?: string[];
}
