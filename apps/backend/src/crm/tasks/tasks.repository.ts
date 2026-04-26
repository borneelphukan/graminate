import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { Prisma, tasks, kanban_columns } from '@prisma/client';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createTask(dto: CreateTaskDto): Promise<tasks> {
    try {
      const newTask = await this.prisma.tasks.create({
        data: {
          user_id: dto.user_id,
          project: dto.project,
          task: dto.task || null,
          status: dto.status || null,
          description: dto.description || null,
          priority: dto.priority || null,
          deadline: dto.deadline ? new Date(dto.deadline) : null,
        },
      });
      return newTask;
    } catch (error) {
      console.error('Error creating task entry:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to create task entry',
      );
    }
  }

  async getTasksByUser(
    userId: number,
    project?: string,
    deadlineDate?: string,
  ): Promise<tasks[]> {
    try {
      const where: Prisma.tasksWhereInput = { user_id: userId };

      if (project) {
        where.project = project;
      }

      if (deadlineDate) {
        where.deadline = new Date(deadlineDate);
      }

      const tasksList = await this.prisma.tasks.findMany({
        where,
        orderBy: [{ deadline: 'asc' }, { created_on: 'desc' }],
      });
      return tasksList;
    } catch (error) {
      console.error('Error fetching tasks by user:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to fetch tasks',
      );
    }
  }

  async updateTask(taskId: number, dto: UpdateTaskDto): Promise<tasks> {
    if (dto.priority && !['Low', 'Medium', 'High'].includes(dto.priority)) {
      throw new BadRequestException('Invalid priority value');
    }

    const data: Prisma.tasksUpdateInput = {};
    if (dto.project !== undefined) data.project = dto.project;
    if (dto.task !== undefined) data.task = dto.task;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.deadline !== undefined)
      data.deadline = dto.deadline ? new Date(dto.deadline) : null;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const updatedTask = await this.prisma.tasks.update({
        where: { task_id: taskId },
        data,
      });
      return updatedTask;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
      console.error('Database error:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to update task',
      );
    }
  }

  async deleteTask(taskId: number): Promise<tasks> {
    try {
      const deletedTask = await this.prisma.tasks.delete({
        where: { task_id: taskId },
      });
      return deletedTask;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to delete task',
      );
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.tasks.deleteMany({});
      return { message: `Tasks table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getKanbanColumns(
    userId: number,
    project: string,
  ): Promise<kanban_columns[]> {
    try {
      const columns = await this.prisma.kanban_columns.findMany({
        where: { user_id: userId, project },
        orderBy: { position: 'asc' },
      });

      if (columns.length === 0) {
        await this.prisma.kanban_columns.createMany({
          data: [
            { user_id: userId, project, title: 'TO DO', position: 0 },
            { user_id: userId, project, title: 'IN PROGRESS', position: 1 },
            { user_id: userId, project, title: 'CHECK', position: 2 },
            { user_id: userId, project, title: 'DONE', position: 3 },
          ],
        });

        return await this.prisma.kanban_columns.findMany({
          where: { user_id: userId, project },
          orderBy: { position: 'asc' },
        });
      }

      return columns;
    } catch (error) {
      console.error('Error fetching kanban columns:', error);
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch kanban columns',
      );
    }
  }

  async addKanbanColumn(
    userId: number,
    project: string,
    title: string,
    position: number,
  ): Promise<kanban_columns> {
    try {
      return await this.prisma.kanban_columns.create({
        data: {
          user_id: userId,
          project,
          title,
          position,
        },
      });
    } catch (error) {
      console.error('Error adding kanban column:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to add kanban column',
      );
    }
  }

  async updateKanbanColumn(
    columnId: number,
    title?: string,
    position?: number,
  ): Promise<kanban_columns> {
    try {
      const data: Prisma.kanban_columnsUpdateInput = {};
      if (title !== undefined) data.title = title;
      if (position !== undefined) data.position = position;

      return await this.prisma.kanban_columns.update({
        where: { column_id: columnId },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Kanban column with ID ${columnId} not found`,
        );
      }
      console.error('Error updating kanban column:', error);
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to update kanban column',
      );
    }
  }

  async deleteKanbanColumn(columnId: number): Promise<kanban_columns> {
    try {
      return await this.prisma.kanban_columns.delete({
        where: { column_id: columnId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Kanban column with ID ${columnId} not found`,
        );
      }
      console.error('Error deleting kanban column:', error);
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to delete kanban column',
      );
    }
  }
}
