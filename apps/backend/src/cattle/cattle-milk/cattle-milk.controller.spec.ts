import { Test, TestingModule } from '@nestjs/testing';
import { CattleMilkController } from './cattle-milk.controller';
import { CattleMilkService } from './cattle-milk.service';
import { HttpException } from '@nestjs/common';

describe('CattleMilkController', () => {
  let controller: CattleMilkController;
  let service: CattleMilkService;

  const mockService = {
    findByUserId: jest.fn(),
    findByCattleId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAnimalNamesByCattleId: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CattleMilkController],
      providers: [{ provide: CattleMilkService, useValue: mockService }],
    }).compile();

    controller = module.get<CattleMilkController>(CattleMilkController);
    service = module.get<CattleMilkService>(CattleMilkService);
  });

  it('findAnimalNamesByCattleId aggregates output array', async () => {
    mockService.findAnimalNamesByCattleId.mockResolvedValue(['Bessie', 'Daisy']);
    const res = await controller.getAnimalNamesForHerd(100);
    expect(res).toEqual({ animalNames: ['Bessie', 'Daisy'] });
  });

  it('deleteRecord throws bad request or not found on false', async () => {
    mockService.delete.mockResolvedValue(false);
    await expect(controller.deleteRecord(1)).rejects.toThrow(HttpException);
  });
});
