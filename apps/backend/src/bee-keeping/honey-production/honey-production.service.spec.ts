import { Test, TestingModule } from '@nestjs/testing';
import { HoneyProductionService } from './honey-production.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('HoneyProductionService', () => {
  let service: HoneyProductionService;
  let prisma: any;

  const mockPrisma = {
    honey_production: {
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
      providers: [
        HoneyProductionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HoneyProductionService>(HoneyProductionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findByHiveId', () => {
    it('gets records', async () => {
      prisma.honey_production.findMany.mockResolvedValue([{ id: 1 }]);
      expect(await service.findByHiveId(2)).toEqual([{ id: 1 }]);
    });
  });

  describe('findById', () => {
    it('returns resource', async () => {
      prisma.honey_production.findUnique.mockResolvedValue({ id: 1 });
      expect(await service.findById(1)).toEqual({ id: 1 });
    });

    it('throws not found', async () => {
      prisma.honey_production.findUnique.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('returns boolean status', async () => {
      prisma.honey_production.delete.mockResolvedValue({});
      expect(await service.delete(1)).toBe(true);
    });
  });
});
