import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';

describe('TasksService', () => {
  let service: TasksService;
  const mockRepo = {
    getTasksByUser: jest.fn(),
    getColumns: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: TasksRepository, useValue: mockRepo }],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  it('delegates getTasksByUser calls', async () => {
    mockRepo.getTasksByUser.mockResolvedValue([]);
    await service.getTasksByUser(1);
    expect(mockRepo.getTasksByUser).toHaveBeenCalled();
  });
});
