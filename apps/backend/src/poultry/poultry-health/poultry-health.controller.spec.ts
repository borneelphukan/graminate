import { Test, TestingModule } from '@nestjs/testing';
import { PoultryHealthController } from './poultry-health.controller';
import { PoultryHealthService } from './poultry-health.service';

describe('PoultryHealthController', () => {
  let controller: PoultryHealthController;
  let service: PoultryHealthService;

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
      controllers: [PoultryHealthController],
      providers: [{ provide: PoultryHealthService, useValue: mockService }],
    }).compile();

    controller = module.get<PoultryHealthController>(PoultryHealthController);
    service = module.get<PoultryHealthService>(PoultryHealthService);
  });

  it('queries route parameter string mappings correctly into service numeric payloads', async () => {
    mockService.findByUserIdWithFilters.mockResolvedValue([]);
    await controller.getPoultryHealthRecords('10');
    expect(service.findByUserIdWithFilters).toHaveBeenCalledWith(10, {
      limit: undefined,
      offset: undefined,
      flockId: undefined,
    });
  });
});
