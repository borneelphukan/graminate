import { Test, TestingModule } from '@nestjs/testing';
import { CattleMilkService } from './cattle-milk.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('CattleMilkService', () => {
  let service: CattleMilkService;
  let prisma: any;

  const mockPrisma = {
    cattle_milk: {
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
        CattleMilkService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CattleMilkService>(CattleMilkService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findByUserId', () => {
    it('bubbles internal server error on throw', async () => {
      prisma.cattle_milk.findMany.mockRejectedValue(new Error('Oops'));
      await expect(service.findByUserId(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('throws NotFound exception if returns null from db', async () => {
      prisma.cattle_milk.findUnique.mockResolvedValue(null);
      await expect(service.findById(10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('handles creation values passing properly', async () => {
      prisma.cattle_milk.create.mockResolvedValue({ id: 1 });
      await service.create({
        cattle_id: 1,
        milk_produced: 4.5,
        date_collected: '2025-01-01',
      } as any);
      expect(prisma.cattle_milk.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ milk_produced: 4.5 }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('swallows error and returns false', async () => {
      prisma.cattle_milk.delete.mockRejectedValue(new Error());
      expect(await service.delete(1)).toBe(false);
    });
  });
});
