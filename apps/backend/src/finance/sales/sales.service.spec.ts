import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('SalesService', () => {
  let service: SalesService;
  const mockPrisma = {
    sales: {
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
        SalesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<SalesService>(SalesService);
  });

  it('safely captures valid data return from findMany query', async () => {
    mockPrisma.sales.findMany.mockResolvedValue([]);
    const r = await service.findByUserId(1);
    expect(r).toEqual([]);
  });
});
