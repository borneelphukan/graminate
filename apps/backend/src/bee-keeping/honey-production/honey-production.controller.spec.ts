import { Test, TestingModule } from '@nestjs/testing';
import { HoneyProductionController } from './honey-production.controller';
import { HoneyProductionService } from './honey-production.service';
import { NotFoundException } from '@nestjs/common';

describe('HoneyProductionController', () => {
  let controller: HoneyProductionController;
  let service: HoneyProductionService;

  const mockService = {
    findByHiveId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoneyProductionController],
      providers: [{ provide: HoneyProductionService, useValue: mockService }],
    }).compile();

    controller = module.get<HoneyProductionController>(
      HoneyProductionController,
    );
    service = module.get<HoneyProductionService>(HoneyProductionService);
  });

  it('getByHiveId packages return', async () => {
    mockService.findByHiveId.mockResolvedValue([{}]);
    const result = await controller.getByHiveId(1);
    expect(result).toHaveProperty('harvests');
  });

  it('handles delete validation lifecycle', async () => {
    mockService.delete.mockResolvedValue(false);
    await expect(controller.deleteHarvest(1)).rejects.toThrow(
      NotFoundException,
    );

    mockService.delete.mockResolvedValue(true);
    expect((await controller.deleteHarvest(1)).message).toContain('deleted');
  });
});
