import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  const mockPrisma = {
    expenses: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpensesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<ExpensesService>(ExpensesService);
  });

  it('fetches expenses successfully', async () => {
    mockPrisma.expenses.findMany.mockResolvedValue([]);
    const res = await service.findByUserId(1);
    expect(res).toEqual([]);
  });
});
