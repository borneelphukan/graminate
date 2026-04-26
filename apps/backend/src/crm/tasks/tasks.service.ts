import { Injectable } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { TasksRepository } from './tasks.repository';
import { tasks, kanban_columns } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async createTask(dto: CreateTaskDto): Promise<tasks> {
    return this.tasksRepository.createTask(dto);
  }

  async getTasksByUser(
    userId: number,
    project?: string,
    deadlineDate?: string,
  ): Promise<tasks[]> {
    return this.tasksRepository.getTasksByUser(userId, project, deadlineDate);
  }

  async updateTask(taskId: number, dto: UpdateTaskDto): Promise<tasks> {
    return this.tasksRepository.updateTask(taskId, dto);
  }

  async deleteTask(taskId: number): Promise<tasks> {
    return this.tasksRepository.deleteTask(taskId);
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    return this.tasksRepository.resetTable(userId);
  }

  async getKanbanColumns(
    userId: number,
    project: string,
  ): Promise<kanban_columns[]> {
    return this.tasksRepository.getKanbanColumns(userId, project);
  }

  async addKanbanColumn(
    userId: number,
    project: string,
    title: string,
    position: number,
  ): Promise<kanban_columns> {
    return this.tasksRepository.addKanbanColumn(
      userId,
      project,
      title,
      position,
    );
  }

  async updateKanbanColumn(
    columnId: number,
    title?: string,
    position?: number,
  ): Promise<kanban_columns> {
    return this.tasksRepository.updateKanbanColumn(columnId, title, position);
  }

  async deleteKanbanColumn(columnId: number): Promise<kanban_columns> {
    return this.tasksRepository.deleteKanbanColumn(columnId);
  }
}
