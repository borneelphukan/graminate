import { Test, TestingModule } from '@nestjs/testing';
import { FloricultureService } from './floriculture.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('FloricultureService', () => {
  let service: FloricultureService;
  let prisma: any;

  const mockPrisma = {
    floriculture: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    flower_watering: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FloricultureService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FloricultureService>(FloricultureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('normalizes date and serializes count', async () => {
      prisma.floriculture.create.mockResolvedValue({ id: 1 });
      await service.create({
        flower_name: 'Lily',
        planting_date: '2025-01-01',
      } as any);
      expect(prisma.floriculture.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            planting_date: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('getWateringByDate', () => {
    it('performs inclusion query on flowers with mapped date object', async () => {
      prisma.floriculture.findMany.mockResolvedValue([]);
      await service.getWateringByDate(1, '2025-01-02');
      expect(prisma.floriculture.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 },
          include: {
            flower_watering: {
              where: {
                watering_date: new Date('2025-01-02T00:00:00Z'),
              },
            },
          },
        }),
      );
    });
  });

  describe('updateWatering', () => {
    it('upserts nested join data matching keys', async () => {
      prisma.flower_watering.upsert.mockResolvedValue({});
      await service.updateWatering(1, 5, '2025-05-01', true);
      expect(prisma.flower_watering.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            flower_id_watering_date: {
              flower_id: 5,
              watering_date: expect.any(Date),
            },
          },
        }),
      );
    });
  });

  describe('removals', () => {
    it('removeMultiple triggers in filter', async () => {
      prisma.floriculture.deleteMany.mockResolvedValue({});
      await service.removeMultiple([1, 2]);
      expect(prisma.floriculture.deleteMany).toHaveBeenCalledWith({
        where: { flower_id: { in: [1, 2] } },
      });
    });
  });
});
