import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  const mockService = {
    getTasksByUser: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockService }],
    }).compile();
    controller = module.get<TasksController>(TasksController);
  });

  it('handles fetch request by resolving straight payload', async () => {
    mockService.getTasksByUser.mockResolvedValue([]);
    const result = await controller.getTasks(1);
    expect(result.tasks).toEqual([]);
  });
});
