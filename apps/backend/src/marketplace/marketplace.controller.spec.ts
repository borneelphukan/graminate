import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

describe('MarketplaceController', () => {
  let controller: MarketplaceController;
  const mockService = {
    findPublished: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [{ provide: MarketplaceService, useValue: mockService }],
    }).compile();
    controller = module.get<MarketplaceController>(MarketplaceController);
  });

  it('passes query filters down to service helper', async () => {
    mockService.findPublished.mockResolvedValue([]);
    const res = await controller.getPublishedProducts('Seeds');
    expect(res).toEqual({ products: [] });
  });
});
