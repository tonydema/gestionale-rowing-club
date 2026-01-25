import { IsString, IsDateString, IsEnum, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkoutType {
  PESI = 'PESI',
  CORSA = 'CORSA',
  REMERGOMETRO = 'REMERGOMETRO',
  BARCA = 'BARCA',
  BIKE = 'BIKE',
}

export class CreateWorkoutDto {
  @ApiProperty()
  @IsString()
  groupId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsDateString()
  startDateTime: string;

  @ApiProperty()
  @IsDateString()
  endDateTime: string;

  @ApiProperty({ enum: WorkoutType })
  @IsEnum(WorkoutType)
  type: WorkoutType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  distance?: number; // in metri

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  repetitions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  weightDescription?: string; // per pesi

  @ApiProperty({ required: false, description: 'Numero di settimane per duplicare l\'allenamento' })
  @IsOptional()
  @IsInt()
  @Min(1)
  duplicateWeeks?: number;
}
