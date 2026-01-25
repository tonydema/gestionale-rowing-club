import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';

@ApiTags('public')
@Controller('public/workouts')
export class PublicWorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.workoutsService.findAll(query);
  }
}
