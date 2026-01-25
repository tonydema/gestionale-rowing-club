import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  @Roles('ADMIN', 'ALLENATORE')
  create(@Body() createWorkoutDto: CreateWorkoutDto, @Req() req: any) {
    return this.workoutsService.create(createWorkoutDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.workoutsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'ALLENATORE')
  update(@Param('id') id: string, @Body() updateWorkoutDto: UpdateWorkoutDto) {
    return this.workoutsService.update(id, updateWorkoutDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ALLENATORE')
  remove(@Param('id') id: string) {
    return this.workoutsService.remove(id);
  }
}
