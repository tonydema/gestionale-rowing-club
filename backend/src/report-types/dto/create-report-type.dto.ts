import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportTypeDto {
  @ApiProperty({ description: 'Nome della tipologia' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descrizione della tipologia' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Prezzo/compenso di default' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Se la tipologia è abilitata', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
