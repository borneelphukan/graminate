import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;
  const mockPrisma = {
    inventory: {
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
      providers: [InventoryService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<InventoryService>(InventoryService);
  });

  it('gets inventory list resolving correctly', async () => {
    mockPrisma.inventory.findMany.mockResolvedValue([]);
    const res = await service.findByUserIdWithFilters(1, {} as any);
    expect(res).toEqual([]);
  });
});
