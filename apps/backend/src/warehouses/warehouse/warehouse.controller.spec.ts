import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

describe('WarehouseController', () => {
  let controller: WarehouseController;
  const mockService = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseController],
      providers: [{ provide: WarehouseService, useValue: mockService }],
    }).compile();
    controller = module.get<WarehouseController>(WarehouseController);
  });

  it('responds direct resolve flow from service lookup', async () => {
    mockService.findByUserId.mockResolvedValue([]);
    const rows = await controller.getByUserId('1');
    expect(rows).toEqual({ warehouses: [] });
  });
});
