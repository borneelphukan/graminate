import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseService } from './warehouse.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('WarehouseService', () => {
  let service: WarehouseService;
  const mockPrisma = {
    warehouse: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehouseService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<WarehouseService>(WarehouseService);
  });

  it('findMany retrieves rows correctly formatted', async () => {
    mockPrisma.warehouse.findMany.mockResolvedValue([]);
    const rows = await service.findByUserId(1);
    expect(rows).toEqual([]);
  });
});
