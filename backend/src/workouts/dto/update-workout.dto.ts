import { PartialType } from '@nestjs/swagger';
import { CreateWorkoutDto } from './create-workout.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateWorkoutDto extends PartialType(
  OmitType(CreateWorkoutDto, ['duplicateWeeks'] as const)
) {}
