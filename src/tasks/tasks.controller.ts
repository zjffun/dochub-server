import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';
import Rules from 'src/decorators/rules';
import { RolesGuard } from 'src/guards/roles.guard';
import { TasksService } from './tasks.service';

@Controller(apiPrefix)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('v1/tasks/setDocProgress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async setDocProgress() {
    return this.tasksService.setDocProgress();
  }
}
