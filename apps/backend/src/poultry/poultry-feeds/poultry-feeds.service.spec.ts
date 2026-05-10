import { Test, TestingModule } from '@nestjs/testing';
import { PoultryFeedsService } from './poultry-feeds.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('PoultryFeedsService', () => {
  let service: PoultryFeedsService;
  let prisma: any;

  const mockPrisma = {
    poultry_feeds: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoultryFeedsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<PoultryFeedsService>(PoultryFeedsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findByUserIdWithFilters routes limit and filter conditions correctly', async () => {
    prisma.poultry_feeds.findMany.mockResolvedValue([]);
    await service.findByUserIdWithFilters(1, { limit: 5 });
    expect(prisma.poultry_feeds.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 5,
      where: expect.objectContaining({ user_id: 1 }),
    }));
  });

  it('delete properly performs cleanup return hook', async () => {
    prisma.poultry_feeds.delete.mockResolvedValue({});
    expect(await service.delete(1)).toBe(true);
  });
});
