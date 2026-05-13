import { Test, TestingModule } from '@nestjs/testing';
import { HiveInspectionController } from './hive-inspection.controller';
import { HiveInspectionService } from './hive-inspection.service';
import { NotFoundException } from '@nestjs/common';

describe('HiveInspectionController', () => {
  let controller: HiveInspectionController;
  let service: HiveInspectionService;

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
      controllers: [HiveInspectionController],
      providers: [{ provide: HiveInspectionService, useValue: mockService }],
    }).compile();

    controller = module.get<HiveInspectionController>(HiveInspectionController);
    service = module.get<HiveInspectionService>(HiveInspectionService);
  });

  it('getByHiveId packs in object key', async () => {
    mockService.findByHiveId.mockResolvedValue([{ id: 1 }]);
    expect(await controller.getByHiveId(1)).toEqual({
      inspections: [{ id: 1 }],
    });
  });

  it('deleteInspection throws NotFound when result is false', async () => {
    mockService.delete.mockResolvedValue(false);
    await expect(controller.deleteInspection(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deleteInspection returns message when successful', async () => {
    mockService.delete.mockResolvedValue(true);
    const res = await controller.deleteInspection(1);
    expect(res.message).toContain('deleted');
  });
});
