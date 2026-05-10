import { Test, TestingModule } from '@nestjs/testing';
import { PoultryHealthService } from './poultry-health.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PoultryHealthService', () => {
  let service: PoultryHealthService;
  let prisma: any;

  const mockPrisma = {
    poultry_health: {
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
      providers: [PoultryHealthService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<PoultryHealthService>(PoultryHealthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('initializes with ISO dates when provided for followup', async () => {
      prisma.poultry_health.create.mockResolvedValue({ id: 1 });
      await service.create({ next_appointment: '2025-01-01' } as any);
      expect(prisma.poultry_health.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ next_appointment: expect.any(Date) }),
      }));
    });
  });

  describe('findById', () => {
    it('returns null when not existing', async () => {
      prisma.poultry_health.findUnique.mockResolvedValue(null);
      const result = await service.findById(500);
      expect(result).toBeNull();
    });
  });
});
