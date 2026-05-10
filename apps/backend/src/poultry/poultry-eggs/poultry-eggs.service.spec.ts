import { Test, TestingModule } from '@nestjs/testing';
import { PoultryEggsService } from './poultry-eggs.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('PoultryEggsService', () => {
  let service: PoultryEggsService;
  let prisma: any;

  const mockPrisma = {
    poultry_eggs: {
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
      providers: [PoultryEggsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<PoultryEggsService>(PoultryEggsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findByUserIdWithFilters', () => {
    it('applies filter options explicitly down into prisma select block', async () => {
      prisma.poultry_eggs.findMany.mockResolvedValue([]);
      await service.findByUserIdWithFilters(1, { limit: 10, offset: 5, flockId: 100 });
      expect(prisma.poultry_eggs.findMany).toHaveBeenCalledWith(expect.objectContaining({
        take: 10,
        skip: 5,
        where: expect.objectContaining({ flock_id: 100, user_id: 1 }),
      }));
    });
  });

  describe('create', () => {
    it('formats incoming inputs ensuring typed dates are parsed', async () => {
      prisma.poultry_eggs.create.mockResolvedValue({ id: 1 });
      await service.create({ date_collected: '2025-01-01' } as any);
      expect(prisma.poultry_eggs.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          date_collected: expect.any(Date),
        }),
      }));
    });
  });
});
