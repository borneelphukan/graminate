import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, ResetTaskDto, UpdateTaskDto } from './tasks.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { tasks, kanban_columns } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getTasks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('project') project?: string,
    @Query('deadlineDate') deadlineDate?: string,
  ): Promise<{ tasks: tasks[] }> {
    const tasksList = await this.tasksService.getTasksByUser(
      userId,
      project,
      deadlineDate,
    );
    return { tasks: tasksList };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<tasks> {
    const task = await this.tasksService.createTask(createTaskDto);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<tasks> {
    const task = await this.tasksService.updateTask(id, updateTaskDto);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<tasks> {
    const task = await this.tasksService.deleteTask(id);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetInventory(
    @Body() resetDto: ResetTaskDto,
  ): Promise<{ message: string }> {
    return this.tasksService.resetTable(resetDto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('columns/:userId')
  async getKanbanColumns(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('project') project: string,
  ): Promise<{ columns: kanban_columns[] }> {
    const columns = await this.tasksService.getKanbanColumns(userId, project);
    return { columns };
  }

  @UseGuards(JwtAuthGuard)
  @Post('column/add')
  async addKanbanColumn(
    @Body()
    body: {
      userId: number;
      project: string;
      title: string;
      position: number;
    },
  ): Promise<kanban_columns> {
    const column = await this.tasksService.addKanbanColumn(
      body.userId,
      body.project,
      body.title,
      body.position,
    );
    return column;
  }

  @UseGuards(JwtAuthGuard)
  @Put('column/update/:id')
  async updateKanbanColumn(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; position?: number },
  ): Promise<kanban_columns> {
    const column = await this.tasksService.updateKanbanColumn(
      id,
      body.title,
      body.position,
    );
    return column;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('column/delete/:id')
  async deleteKanbanColumn(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<kanban_columns> {
    const column = await this.tasksService.deleteKanbanColumn(id);
    return column;
  }
}
