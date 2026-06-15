import { Test, TestingModule } from '@nestjs/testing';
import { ContractsRepository } from './contracts.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('ContractsRepository', () => {
  let repository: ContractsRepository;

  const mockPrisma = {
    contracts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    repository = module.get<ContractsRepository>(ContractsRepository);
  });

  describe('getContracts', () => {
    it('resolves 200 code on standard call', async () => {
      mockPrisma.contracts.findMany.mockResolvedValue([]);
      const res = await repository.getContracts();
      expect(res.status).toBe(200);
    });
  });
});
