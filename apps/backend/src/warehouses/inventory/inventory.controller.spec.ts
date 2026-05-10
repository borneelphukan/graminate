import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  const mockService = {
    findByUserIdWithFilters: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: mockService }],
    }).compile();
    controller = module.get<InventoryController>(InventoryController);
  });

  it('hands over payload with simple array mapping wrapped object', async () => {
    mockService.findByUserIdWithFilters.mockResolvedValue([]);
    const result = await controller.getInventory('1');
    expect(result).toEqual({ items: [] });
  });
});
