import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LoansService', () => {
  let service: LoansService;
  const mockPrisma = {
    loans: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoansService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<LoansService>(LoansService);
  });

  it('retrieves basic records set from findMany handle', async () => {
    mockPrisma.loans.findMany.mockResolvedValue([{ id: 1 }]);
    const list = await service.findAll(1);
    expect(list).toHaveLength(1);
  });
});
