import { Test, TestingModule } from '@nestjs/testing';
import { FlockService } from './flock.service';
import { PrismaService } from '@/prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('FlockService', () => {
  let service: FlockService;
  let prisma: any;

  const mockPrisma = {
    poultry_flock: {
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
        FlockService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FlockService>(FlockService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('formats incoming inputs correctly', async () => {
      prisma.poultry_flock.create.mockResolvedValue({ id: 1 });
      await service.create({ flock_name: 'A', quantity: 50 } as any);
      expect(prisma.poultry_flock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            flock_name: 'A',
            quantity: 50,
          }),
        }),
      );
    });

    it('bubbles failure when server creates fault', async () => {
      prisma.poultry_flock.create.mockRejectedValue(new Error());
      await expect(service.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
