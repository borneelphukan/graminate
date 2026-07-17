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
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, ResetTaskDto, UpdateTaskDto } from './tasks.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { tasks, kanban_columns } from '@prisma/client';
import { kanbanColumnsSchema, taskSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getTasks(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
    @Query('project') project?: string,
    @Query('deadlineDate') deadlineDate?: string,
  ): Promise<{ tasks: tasks[] }> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
    const tasksList = await this.tasksService.getTasksByUser(
      userId,
      project,
      deadlineDate,
    );
    return { tasks: tasksList };
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(taskSchema)
  @Post('add')
  async createTask(@Body() createTaskDto: CreateTaskDto, @Request() req: RequestWithUser): Promise<tasks> {
    createTaskDto.user_id = req.user.userId!;
    const task = await this.tasksService.createTask(createTaskDto);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(taskSchema, { partial: true })
  @Put('update/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser,
  ): Promise<tasks> {
    const task = await this.tasksService.updateTask(id, updateTaskDto, req.user.userId!);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<tasks> {
    const task = await this.tasksService.deleteTask(id, req.user.userId!);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetInventory(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.tasksService.resetTable(req.user.userId!);
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
  @UseZodSchema(kanbanColumnsSchema)
  @Post('column/add')
  async addKanbanColumn(
    @Request() req: RequestWithUser,
    @Body()
    body: {
      project: string;
      title: string;
      position: number;
    },
  ): Promise<kanban_columns> {
    const column = await this.tasksService.addKanbanColumn(
      req.user.userId!,
      body.project,
      body.title,
      body.position,
    );
    return column;
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(kanbanColumnsSchema, { partial: true })
  @Put('column/update/:id')
  async updateKanbanColumn(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; position?: number },
    @Request() req: RequestWithUser,
  ): Promise<kanban_columns> {
    const column = await this.tasksService.updateKanbanColumn(
      id,
      body.title,
      body.position,
      req.user.userId!,
    );
    return column;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('column/delete/:id')
  async deleteKanbanColumn(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<kanban_columns> {
    const column = await this.tasksService.deleteKanbanColumn(id, req.user.userId!);
    return column;
  }
}
