import { Test, TestingModule } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('TasksRepository', () => {
  let repository: TasksRepository;
  const mockPrisma = {
    tasks: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    kanban_columns: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    repository = module.get<TasksRepository>(TasksRepository);
  });

  it('gets columns successfully with nested data mocks', async () => {
    mockPrisma.kanban_columns.findMany.mockResolvedValue([
      { id: 1, title: 'To Do' },
    ]);
    const res = await repository.getKanbanColumns(1, 'P');
    expect(res).toBeDefined();
  });
});
