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
}
