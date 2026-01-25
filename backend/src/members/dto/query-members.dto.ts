import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsBoolean, IsEnum } from 'class-validator';

export enum AgeCategory {
  ALLIEVI_A = 'ALLIEVI_A',
  ALLIEVI_B = 'ALLIEVI_B',
  ALLIEVI_C = 'ALLIEVI_C',
  CADETTI = 'CADETTI',
  UNDER_17 = 'UNDER_17',
  UNDER_19 = 'UNDER_19',
  UNDER_23 = 'UNDER_23',
  SENIOR = 'SENIOR',
  SENIOR_MASTER = 'SENIOR_MASTER',
}

export class QueryMembersDto {
  @ApiProperty({ example: 1, required: false, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ example: 'Rossi', required: false, description: 'Search by name, surname, or fiscal code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: true, required: false, description: 'Filter by active status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: AgeCategory, required: false, description: 'Filter by age category' })
  @IsOptional()
  @IsEnum(AgeCategory)
  category?: AgeCategory;
}
