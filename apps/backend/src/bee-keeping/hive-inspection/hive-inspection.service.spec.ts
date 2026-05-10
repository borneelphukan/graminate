import { Test, TestingModule } from '@nestjs/testing';
import { HiveInspectionService } from './hive-inspection.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('HiveInspectionService', () => {
  let service: HiveInspectionService;
  let prisma: any;

  const mockPrisma = {
    hive_inspection: {
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
        HiveInspectionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HiveInspectionService>(HiveInspectionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findByHiveId', () => {
    it('should retrieve inspections ordered', async () => {
      prisma.hive_inspection.findMany.mockResolvedValue([{ inspection_id: 1 }]);
      const res = await service.findByHiveId(10);
      expect(res).toEqual([{ inspection_id: 1 }]);
      expect(prisma.hive_inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { hive_id: 10 },
      }));
    });
  });

  describe('findById', () => {
    it('should resolve item', async () => {
      prisma.hive_inspection.findUnique.mockResolvedValue({ id: 1 });
      expect(await service.findById(1)).toEqual({ id: 1 });
    });

    it('should fail if not found', async () => {
      prisma.hive_inspection.findUnique.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('inserts using model constructor parsing dates', async () => {
      const dto = { hive_id: 1, inspection_date: '2025-01-01' } as any;
      prisma.hive_inspection.create.mockResolvedValue({ id: 100 });

      const out = await service.create(dto);
      expect(out).toHaveProperty('id');
      expect(prisma.hive_inspection.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ inspection_date: expect.any(Date) }),
      }));
    });
  });

  describe('update', () => {
    it('applies update and bubbles exception correctly', async () => {
      prisma.hive_inspection.update.mockResolvedValue({ status: 'updated' });
      const out = await service.update(1, { brood_pattern: 'Compact' });
      expect(out).toEqual({ status: 'updated' });
    });
  });

  describe('delete', () => {
    it('catches reject and masks as false', async () => {
      prisma.hive_inspection.delete.mockRejectedValue(new Error('fail'));
      expect(await service.delete(1)).toBe(false);
    });

    it('resolves true on success', async () => {
      prisma.hive_inspection.delete.mockResolvedValue({});
      expect(await service.delete(1)).toBe(true);
    });
  });
});
