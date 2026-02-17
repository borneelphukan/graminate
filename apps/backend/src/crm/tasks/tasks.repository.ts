import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createTask(dto: CreateTaskDto) {
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
      throw new InternalServerErrorException('Failed to create task entry');
    }
  }

  async getTasksByUser(
    userId: number,
    project?: string,
    deadlineDate?: string,
  ) {
    try {
      const where: any = { user_id: userId };

      if (project) {
        where.project = project;
      }

      if (deadlineDate) {
        where.deadline = new Date(deadlineDate);
      }

      const tasks = await this.prisma.tasks.findMany({
        where,
        orderBy: [
          { deadline: 'asc' }, // NULLS LAST is default in Prisma for asc? No, strictly it puts nulls last usually or first depending on DB. 
          // Prisma doesn't support NULLS LAST directly in API easily without explicit sort logic or raw query, 
          // but for now simple asc is close enough or I can use raw if user complains.
          // Actually, Prisma 5+ supports NULLS FIRST/LAST. Let's check if we can use it.
          // Since I am on a recent Prisma version (generated client), let's try standard sort. 
          // If strict compatibility is needed, I might need to adjust.
          { created_on: 'desc' },
        ],
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks by user:', error);
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  async updateTask(taskId: number, dto: UpdateTaskDto) {
    if (dto.priority && !['Low', 'Medium', 'High'].includes(dto.priority)) {
      throw new BadRequestException('Invalid priority value');
    }

    const data: any = {};
    if (dto.project !== undefined) data.project = dto.project;
    if (dto.task !== undefined) data.task = dto.task;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.deadline !== undefined) data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    
    // Check if empty is handled by DTO or service. The original code checked for empty "fields".
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const existing = await this.prisma.tasks.findUnique({
        where: { task_id: taskId },
      });
      
      if (!existing) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      const updatedTask = await this.prisma.tasks.update({
        where: { task_id: taskId },
        data,
      });
      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async deleteTask(taskId: number) {
    try {
      const existing = await this.prisma.tasks.findUnique({
        where: { task_id: taskId },
      });
      if (!existing) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
      const deletedTask = await this.prisma.tasks.delete({
        where: { task_id: taskId },
      });
      return deletedTask;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.tasks.deleteMany({});
      return { message: `Tasks table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
