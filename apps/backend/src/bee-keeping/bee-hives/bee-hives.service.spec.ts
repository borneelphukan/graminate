import { Test, TestingModule } from '@nestjs/testing';
import { BeeHivesService } from './bee-hives.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('BeeHivesService', () => {
  let service: BeeHivesService;
  let prisma: any;

  const mockPrisma = {
    bee_hives: {
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
        BeeHivesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BeeHivesService>(BeeHivesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByApiaryId', () => {
    it('should transform array data mapping inspection snapshot', async () => {
      const dateMock = new Date('2025-01-01');
      const mockResponse = [
        {
          hive_id: 1,
          hive_name: 'Test Hive',
          hive_inspection: [
            {
              inspection_id: 101,
              inspection_date: dateMock,
              queen_status: 'Present',
            },
          ],
        },
      ];
      prisma.bee_hives.findMany.mockResolvedValue(mockResponse);

      const result = await service.findByApiaryId(1);
      expect(result[0]).toMatchObject({
        hive_id: 1,
        last_inspection_id: 101,
        last_inspection_date: dateMock,
        queen_status: 'Present',
      });
      expect(result[0]).not.toHaveProperty('hive_inspection');
    });

    it('should fill nulls when no inspections present', async () => {
      prisma.bee_hives.findMany.mockResolvedValue([
        { hive_id: 1, hive_inspection: [] },
      ]);
      const result = await service.findByApiaryId(1);
      expect(result[0].last_inspection_id).toBeNull();
    });

    it('should bubble server error on reject', async () => {
      prisma.bee_hives.findMany.mockRejectedValue(new Error('Boom'));
      await expect(service.findByApiaryId(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should return data on hit', async () => {
      prisma.bee_hives.findUnique.mockResolvedValue({
        hive_id: 2,
        hive_inspection: [],
      });
      const result = await service.findById(2);
      expect(result.hive_id).toBe(2);
    });

    it('should throw NotFoundException if not exists', async () => {
      prisma.bee_hives.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create with passed date or default now', async () => {
      const createInput = { apiary_id: 1, hive_name: 'C1' } as any;
      prisma.bee_hives.create.mockResolvedValue({ hive_id: 5 });

      const res = await service.create(createInput);
      expect(res.hive_id).toBe(5);
      expect(prisma.bee_hives.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            installation_date: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should patch update fields', async () => {
      const updateDto = { hive_name: 'Renamed' };
      prisma.bee_hives.update.mockResolvedValue({
        hive_id: 1,
        hive_name: 'Renamed',
      });
      const res = await service.update(1, updateDto);
      expect(res.hive_name).toBe('Renamed');
    });

    it('should handle prisma P2025 constraint as NotFound', async () => {
      const err = new Prisma.PrismaClientKnownRequestError('err', {
        code: 'P2025',
        clientVersion: '1',
      });
      prisma.bee_hives.update.mockRejectedValue(err);
      await expect(service.update(1, { hive_name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should catch and false silently on failure', async () => {
      prisma.bee_hives.delete.mockRejectedValue(new Error('Delete Error'));
      const result = await service.delete(1);
      expect(result).toBe(false);
    });

    it('should return true on success', async () => {
      prisma.bee_hives.delete.mockResolvedValue({});
      const result = await service.delete(1);
      expect(result).toBe(true);
    });
  });

  describe('resetTable', () => {
    it('successfully deletes many', async () => {
      prisma.bee_hives.deleteMany.mockResolvedValue({});
      const res = await service.resetTable(10);
      expect(res.message).toContain('reset for user 10');
    });
  });
});
