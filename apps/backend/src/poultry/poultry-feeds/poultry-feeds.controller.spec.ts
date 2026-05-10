import { Test, TestingModule } from '@nestjs/testing';
import { PoultryFeedsController } from './poultry-feeds.controller';
import { PoultryFeedsService } from './poultry-feeds.service';

describe('PoultryFeedsController', () => {
  let controller: PoultryFeedsController;
  let service: PoultryFeedsService;

  const mockService = {
    findByUserIdWithFilters: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoultryFeedsController],
      providers: [{ provide: PoultryFeedsService, useValue: mockService }],
    }).compile();

    controller = module.get<PoultryFeedsController>(PoultryFeedsController);
    service = module.get<PoultryFeedsService>(PoultryFeedsService);
  });

  it('forwards filters via parsed integers to underlying service', async () => {
    mockService.findByUserIdWithFilters.mockResolvedValue([]);
    await controller.getPoultryFeedRecords('1', '5', undefined, '10');
    expect(service.findByUserIdWithFilters).toHaveBeenCalledWith(1, {
      limit: 5,
      offset: undefined,
      flockId: 10,
    });
  });
});
