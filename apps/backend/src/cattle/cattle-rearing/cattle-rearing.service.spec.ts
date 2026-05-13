import { Test, TestingModule } from '@nestjs/testing';
import { CattleRearingService } from './cattle-rearing.service';
import { PrismaService } from '@/prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('CattleRearingService', () => {
  let service: CattleRearingService;
  let prisma: any;

  const mockPrisma = {
    cattle_rearing: {
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
        CattleRearingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CattleRearingService>(CattleRearingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findByUserId', () => {
    it('delegates retrieval', async () => {
      prisma.cattle_rearing.findMany.mockResolvedValue([{ id: 1 }]);
      const out = await service.findByUserId(2);
      expect(out).toEqual([{ id: 1 }]);
    });
  });

  describe('create', () => {
    it('forwards user payload parameters correctly', async () => {
      prisma.cattle_rearing.create.mockResolvedValue({ id: 1 });
      await service.create({ breed: 'Angus', cattle_name: 'C1' } as any);
      expect(prisma.cattle_rearing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ cattle_name: 'C1' }),
        }),
      );
    });
  });
});
