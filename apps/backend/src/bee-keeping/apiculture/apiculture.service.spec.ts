import { Test, TestingModule } from '@nestjs/testing';
import { ApicultureService } from './apiculture.service';
import { PrismaService } from '@/prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('ApicultureService', () => {
  let service: ApicultureService;
  let prisma: any;

  const mockPrisma = {
    apiculture: {
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
        ApicultureService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApicultureService>(ApicultureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return apiaries with count mapped', async () => {
      const mockData = [{ apiary_id: 1, apiary_name: 'Hive A', _count: { bee_hives: 5 } }];
      prisma.apiculture.findMany.mockResolvedValue(mockData);

      const result = await service.findByUserId(1);
      expect(result).toEqual([{ apiary_id: 1, apiary_name: 'Hive A', number_of_hives: 5, _count: { bee_hives: 5 } }]);
      expect(prisma.apiculture.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 1 },
      }));
    });

    it('should throw internal server error on fail', async () => {
      prisma.apiculture.findMany.mockRejectedValue(new Error('DB Fail'));
      await expect(service.findByUserId(1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findById', () => {
    it('should return mapped apiary when exists', async () => {
      const mockData = { apiary_id: 1, _count: { bee_hives: 10 } };
      prisma.apiculture.findUnique.mockResolvedValue(mockData);

      const result = await service.findById(1);
      expect(result).toEqual({ apiary_id: 1, _count: { bee_hives: 10 }, number_of_hives: 10 });
    });

    it('should return null when missing', async () => {
      prisma.apiculture.findUnique.mockResolvedValue(null);
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return apiary with 0 count', async () => {
      const dto = { user_id: 1, apiary_name: 'New' } as any;
      prisma.apiculture.create.mockResolvedValue({ apiary_id: 2, ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ apiary_id: 2, user_id: 1, apiary_name: 'New', number_of_hives: 0 });
    });
  });

  describe('update', () => {
    it('should perform update and map response', async () => {
      const mockData = { apiary_id: 1, _count: { bee_hives: 3 }, apiary_name: 'Updated' };
      prisma.apiculture.update.mockResolvedValue(mockData);

      const result = await service.update(1, { apiary_name: 'Updated' });
      expect(result).toEqual({ apiary_id: 1, _count: { bee_hives: 3 }, apiary_name: 'Updated', number_of_hives: 3 });
    });

    it('should fetch by id directly if no data keys provided', async () => {
      const findSpy = jest.spyOn(service, 'findById').mockResolvedValue({} as any);
      await service.update(1, {});
      expect(findSpy).toHaveBeenCalledWith(1);
      expect(prisma.apiculture.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete and return true', async () => {
      prisma.apiculture.delete.mockResolvedValue({ apiary_id: 1 });
      const result = await service.delete(1);
      expect(result).toBe(true);
    });
  });

  describe('reset utilities', () => {
    it('resetForUser should deleteMany with user_id', async () => {
      prisma.apiculture.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.resetForUser(1);
      expect(result.message).toContain('data reset');
      expect(prisma.apiculture.deleteMany).toHaveBeenCalledWith({ where: { user_id: 1 } });
    });

    it('resetTable should clear all', async () => {
      prisma.apiculture.deleteMany.mockResolvedValue({ count: 5 });
      const result = await service.resetTable();
      expect(result.message).toContain('completely reset');
    });
  });
});
