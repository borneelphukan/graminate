import { Injectable } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async createTask(dto: CreateTaskDto) {
    return this.tasksRepository.createTask(dto);
  }

  async getTasksByUser(
    userId: number,
    project?: string,
    deadlineDate?: string,
  ) {
    return this.tasksRepository.getTasksByUser(userId, project, deadlineDate);
  }

  async updateTask(taskId: number, dto: UpdateTaskDto) {
    return this.tasksRepository.updateTask(taskId, dto);
  }

  async deleteTask(taskId: number) {
    return this.tasksRepository.deleteTask(taskId);
  }

  async resetTable(userId: number) {
    return this.tasksRepository.resetTable(userId);
  }

  async getKanbanColumns(userId: number, project: string) {
    return this.tasksRepository.getKanbanColumns(userId, project);
  }

  async addKanbanColumn(userId: number, project: string, title: string, position: number) {
    return this.tasksRepository.addKanbanColumn(userId, project, title, position);
  }

  async updateKanbanColumn(columnId: number, title?: string, position?: number) {
    return this.tasksRepository.updateKanbanColumn(columnId, title, position);
  }

  async deleteKanbanColumn(columnId: number) {
    return this.tasksRepository.deleteKanbanColumn(columnId);
  }
}
