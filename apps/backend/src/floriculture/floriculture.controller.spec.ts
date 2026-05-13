import { Test, TestingModule } from '@nestjs/testing';
import { FloricultureController } from './floriculture.controller';
import { FloricultureService } from './floriculture.service';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { floricultureSchema } from '@graminate/shared';

jest.mock('@graminate/shared', () => ({
  floricultureSchema: {
    partial: jest.fn().mockReturnThis(),
    parse: jest.fn((i) => i),
  },
}));

describe('FloricultureController', () => {
  let controller: FloricultureController;
  let service: FloricultureService;
  let userService: UserService;

  const mockService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    getWateringEvents: jest.fn(),
    getWateringByDate: jest.fn(),
    updateWatering: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeMultiple: jest.fn(),
    reset: jest.fn(),
  };

  const mockUserService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FloricultureController],
      providers: [
        { provide: FloricultureService, useValue: mockService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<FloricultureController>(FloricultureController);
    service = module.get<FloricultureService>(FloricultureService);
    userService = module.get<UserService>(UserService);
  });

  describe('createNotification', () => {
    it('validates owning user and delegates', async () => {
      const req = { user: { userId: 5 } } as any;
      mockUserService.createNotification.mockResolvedValue({ done: true });

      const res = await controller.createNotification(
        '5',
        { title: 'T', message: 'M' },
        req,
      );
      expect(res).toEqual({ done: true });
      expect(userService.createNotification).toHaveBeenCalledWith(
        '5',
        expect.anything(),
      );
    });

    it('blocks mismatched sub with Unauthorized', async () => {
      const req = { user: { userId: 666 } } as any;
      await expect(
        controller.createNotification('100', { title: 'X', message: 'Y' }, req),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create & update data handling', () => {
    it('sanitizes invalid dates and parses schema on add', async () => {
      const badPayload = {
        flower_name: 'Rose',
        planting_date: 'Invalid Date',
      } as any;
      mockService.create.mockResolvedValue({ id: 1 });

      await controller.create(badPayload);
      expect(floricultureSchema.partial().parse).toHaveBeenCalledWith(
        expect.objectContaining({
          planting_date: null,
        }),
      );
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('watering endpoints', () => {
    it('fetches by compound params', async () => {
      mockService.getWateringByDate.mockResolvedValue([]);
      await controller.getWateringByDate(1, '2025');
      expect(service.getWateringByDate).toHaveBeenCalledWith(1, '2025');
    });
  });
});
