import { Test, TestingModule } from '@nestjs/testing';
import { ApicultureController } from './apiculture.controller';
import { ApicultureService } from './apiculture.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { apicultureSchema } from '@graminate/shared';

jest.mock('@graminate/shared', () => ({
  apicultureSchema: {
    parse: jest.fn((input) => input),
  },
}));

describe('ApicultureController', () => {
  let controller: ApicultureController;
  let service: ApicultureService;

  const mockService = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetForUser: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApicultureController],
      providers: [{ provide: ApicultureService, useValue: mockService }],
    }).compile();

    controller = module.get<ApicultureController>(ApicultureController);
    service = module.get<ApicultureService>(ApicultureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should delegate and map result wrap', async () => {
      mockService.findByUserId.mockResolvedValue([{ apiary_id: 1 }]);
      const result = await controller.getByUserId(10);
      expect(service.findByUserId).toHaveBeenCalledWith(10);
      expect(result).toEqual({ apiaries: [{ apiary_id: 1 }] });
    });
  });

  describe('getById', () => {
    it('should return data when found', async () => {
      const mockApiary = { apiary_id: 1 };
      mockService.findById.mockResolvedValue(mockApiary);
      const result = await controller.getById(1);
      expect(result).toBe(mockApiary);
    });

    it('should throw 404 on null result', async () => {
      mockService.findById.mockResolvedValue(null);
      await expect(controller.getById(1)).rejects.toThrow(
        new HttpException('Apiary record not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('addApiary', () => {
    it('should parse input schema and save', async () => {
      const dto = { user_id: 1, apiary_name: 'test' } as any;
      mockService.create.mockResolvedValue({ apiary_id: 10, ...dto });

      await controller.addApiary(dto);

      expect(apicultureSchema.parse).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateApiary', () => {
    it('should throw NOT_FOUND if response is null', async () => {
      mockService.update.mockResolvedValue(null);
      await expect(
        controller.updateApiary(1, { apiary_name: 'fail' } as any),
      ).rejects.toThrow(HttpException);
    });

    it('should return updated data', async () => {
      mockService.update.mockResolvedValue({ apiary_id: 1, name: 'u' });
      const res = await controller.updateApiary(1, { apiary_name: 'u' } as any);
      expect(res).toEqual({ apiary_id: 1, name: 'u' });
    });
  });

  describe('deleteApiary', () => {
    it('should return message on truthy deletion', async () => {
      mockService.delete.mockResolvedValue(true);
      const result = await controller.deleteApiary(1);
      expect(result.message).toContain('deleted successfully');
    });

    it('should throw 404 if deletion fails/record missing', async () => {
      mockService.delete.mockResolvedValue(false);
      await expect(controller.deleteApiary(1)).rejects.toThrow(HttpException);
    });
  });

  describe('resets', () => {
    it('resetService call delegation', async () => {
      mockService.resetForUser.mockResolvedValue({ message: 'reset' });
      await controller.resetService({ userId: 1 });
      expect(service.resetForUser).toHaveBeenCalledWith(1);
    });

    it('reset call delegation', async () => {
      mockService.resetTable.mockResolvedValue({ message: 'done' });
      await controller.reset();
      expect(service.resetTable).toHaveBeenCalled();
    });
  });
});
