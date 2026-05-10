import { Test, TestingModule } from '@nestjs/testing';
import { PoultryEggsController } from './poultry-eggs.controller';
import { PoultryEggsService } from './poultry-eggs.service';

describe('PoultryEggsController', () => {
  let controller: PoultryEggsController;
  let service: PoultryEggsService;

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
      controllers: [PoultryEggsController],
      providers: [{ provide: PoultryEggsService, useValue: mockService }],
    }).compile();

    controller = module.get<PoultryEggsController>(PoultryEggsController);
    service = module.get<PoultryEggsService>(PoultryEggsService);
  });

  it('handles cast queries dynamically and safely maps them to service param', async () => {
    mockService.findByUserIdWithFilters.mockResolvedValue([]);
    await controller.getPoultryEggRecords('1', '10', '5', '200');
    expect(service.findByUserIdWithFilters).toHaveBeenCalledWith(1, {
      limit: 10,
      offset: 5,
      flockId: 200,
    });
  });
});
