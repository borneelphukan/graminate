import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  const mockPrisma = {
    marketplace_products: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplaceService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<MarketplaceService>(MarketplaceService);
  });

  it('retrieves published products listing', async () => {
    mockPrisma.marketplace_products.findMany.mockResolvedValue([]);
    const res = await service.findPublished();
    expect(res).toEqual([]);
  });
});
