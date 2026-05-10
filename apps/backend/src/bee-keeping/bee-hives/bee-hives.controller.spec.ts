import { Test, TestingModule } from '@nestjs/testing';
import { BeeHivesController } from './bee-hives.controller';
import { BeeHivesService } from './bee-hives.service';
import { NotFoundException } from '@nestjs/common';

describe('BeeHivesController', () => {
  let controller: BeeHivesController;
  let service: BeeHivesService;

  const mockService = {
    findByApiaryId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeeHivesController],
      providers: [{ provide: BeeHivesService, useValue: mockService }],
    }).compile();

    controller = module.get<BeeHivesController>(BeeHivesController);
    service = module.get<BeeHivesService>(BeeHivesService);
  });

  describe('getByApiaryId', () => {
    it('wraps output object', async () => {
      mockService.findByApiaryId.mockResolvedValue([{ id: 1 }]);
      const res = await controller.getByApiaryId(5);
      expect(res).toEqual({ hives: [{ id: 1 }] });
      expect(service.findByApiaryId).toHaveBeenCalledWith(5);
    });
  });

  describe('getById', () => {
    it('delegates straightforwardly', async () => {
      const hive = { id: 10 };
      mockService.findById.mockResolvedValue(hive);
      const res = await controller.getById(10);
      expect(res).toBe(hive);
    });
  });

  describe('addHive', () => {
    it('delegates straight to creation service', async () => {
      const input = { apiary_id: 2, hive_name: 'a' } as any;
      mockService.create.mockResolvedValue({ id: 100 });

      await controller.addHive(input);
      expect(service.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateHive', () => {
    it('propagates final data result', async () => {
      mockService.update.mockResolvedValue({ id: 1, changed: true });
      const out = await controller.updateHive(1, { hive_name: 'c' } as any);
      expect(out).toHaveProperty('changed', true);
    });
  });

  describe('deleteHive', () => {
    it('throws NotFoundException on boolean false return from service', async () => {
      mockService.delete.mockResolvedValue(false);
      await expect(controller.deleteHive(1)).rejects.toThrow(NotFoundException);
    });

    it('returns standard ok on true', async () => {
      mockService.delete.mockResolvedValue(true);
      const msg = await controller.deleteHive(1);
      expect(msg.message).toContain('deleted');
    });
  });

  describe('reset', () => {
    it('calls underlying handler', async () => {
      mockService.resetTable.mockResolvedValue({ message: 'ok' });
      await controller.reset({ userId: 5 });
      expect(service.resetTable).toHaveBeenCalledWith(5);
    });
  });
});
