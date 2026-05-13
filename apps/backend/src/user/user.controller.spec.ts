import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;

  const mockUserService = {
    registerUser: jest.fn(),
    logout: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    verifyPassword: jest.fn(),
    scheduleDowngrade: jest.fn(),
    getBillingHistory: jest.fn(),
    getNotifications: jest.fn(),
    markNotificationsRead: jest.fn(),
    deleteNotification: jest.fn(),
    clearAllNotifications: jest.fn(),
    getAvailableSubTypes: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  const makeReq = (userId: number) => ({ user: { userId } }) as any;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register user successfully', async () => {
      mockUserService.registerUser.mockResolvedValue({
        status: 201,
        data: { message: 'OK' },
      });
      const result = await controller.register({
        first_name: 'J',
        last_name: 'D',
        email: 'j@e.com',
        phone_number: '123',
        password: 'pass',
      } as any);
      expect(result).toEqual({ status: 201, data: { message: 'OK' } });
    });

    it('should return 500 on unexpected error', async () => {
      mockUserService.registerUser.mockRejectedValue(new Error('boom'));
      const result = await controller.register({
        first_name: 'J',
        last_name: 'D',
        email: 'j@e.com',
        phone_number: '123',
        password: 'pass',
      } as any);
      expect(result.status).toBe(500);
    });
  });

  describe('login', () => {
    it('should delegate to AuthService.login', async () => {
      mockAuthService.login.mockResolvedValue({ access_token: 'tok' });
      const result = await controller.login({ email: 'e', password: 'p' });
      expect(result).toEqual({ access_token: 'tok' });
      expect(authService.login).toHaveBeenCalledWith('e', 'p');
    });
  });

  describe('logout', () => {
    it('should delegate to UserService.logout', async () => {
      mockUserService.logout.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.logout('lid');
      expect(result.status).toBe(200);
    });
  });

  describe('getUser', () => {
    it('should return user when ownership matches', async () => {
      mockUserService.getUserById.mockResolvedValue({
        status: 200,
        data: { user: { user_id: 1 } },
      });
      const result = await controller.getUser(1, makeReq(1));
      expect(result.status).toBe(200);
    });

    it('should throw UnauthorizedException on ownership mismatch', async () => {
      await expect(controller.getUser(1, makeReq(2))).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update when ownership matches', async () => {
      mockUserService.updateUser.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.updateUser(
        '1',
        { first_name: 'X' },
        makeReq(1),
      );
      expect(result.status).toBe(200);
    });

    it('should throw UnauthorizedException on mismatch', async () => {
      await expect(controller.updateUser('1', {}, makeReq(2))).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete when ownership matches', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.deleteUser('1', makeReq(1));
      expect(result.status).toBe(200);
    });

    it('should throw UnauthorizedException on mismatch', async () => {
      await expect(controller.deleteUser('1', makeReq(2))).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyPassword', () => {
    it('should verify when ownership matches', async () => {
      mockUserService.verifyPassword.mockResolvedValue({
        status: 200,
        data: { valid: true },
      });
      const result = await controller.verifyPassword('1', 'pass', makeReq(1));
      expect(result).toEqual({ valid: true });
    });

    it('should throw UnauthorizedException on mismatch', async () => {
      await expect(
        controller.verifyPassword('1', 'p', makeReq(2)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('scheduleDowngrade', () => {
    it('should schedule when ownership matches', async () => {
      mockUserService.scheduleDowngrade.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.scheduleDowngrade(
        '1',
        'FREE',
        makeReq(1),
      );
      expect(result.status).toBe(200);
    });

    it('should throw UnauthorizedException on mismatch', async () => {
      await expect(
        controller.scheduleDowngrade('1', 'FREE', makeReq(2)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getBillingHistory', () => {
    it('should return billing when ownership matches', async () => {
      mockUserService.getBillingHistory.mockResolvedValue({
        status: 200,
        data: { payments: [] },
      });
      const result = await controller.getBillingHistory('1', makeReq(1));
      expect(result.status).toBe(200);
    });

    it('should throw UnauthorizedException on mismatch', async () => {
      await expect(
        controller.getBillingHistory('1', makeReq(2)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getNotifications', () => {
    it('should return notifications when ownership matches', async () => {
      mockUserService.getNotifications.mockResolvedValue({
        status: 200,
        data: { notifications: [] },
      });
      const result = await controller.getNotifications('1', makeReq(1));
      expect(result.status).toBe(200);
    });
  });

  describe('markNotificationsRead', () => {
    it('should mark read when ownership matches', async () => {
      mockUserService.markNotificationsRead.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.markNotificationsRead(
        '1',
        undefined,
        makeReq(1),
      );
      expect(result.status).toBe(200);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification when ownership matches', async () => {
      mockUserService.deleteNotification.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.deleteNotification('1', '5', makeReq(1));
      expect(result.status).toBe(200);
    });
  });

  describe('clearAllNotifications', () => {
    it('should clear all when ownership matches', async () => {
      mockUserService.clearAllNotifications.mockResolvedValue({
        status: 200,
        data: { message: 'OK' },
      });
      const result = await controller.clearAllNotifications('1', makeReq(1));
      expect(result.status).toBe(200);
    });
  });

  describe('getAvailableSubTypes', () => {
    it('should return sub-types when ownership matches', async () => {
      mockUserService.getAvailableSubTypes.mockResolvedValue({
        status: 200,
        data: { subTypes: ['Poultry'] },
      });
      const result = await controller.getAvailableSubTypes('1', makeReq(1));
      expect(result.status).toBe(200);
    });

    it('should throw UnauthorizedException on mismatch', async () => {
      await expect(
        controller.getAvailableSubTypes('1', makeReq(2)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
