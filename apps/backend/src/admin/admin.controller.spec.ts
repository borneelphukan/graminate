import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockService = {
    getAdminProfile: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    register: jest.fn().mockResolvedValue({ status: 201, data: {} }),
    login: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { access_token: 'tok' } }),
    getAllUsers: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { users: [] } }),
    getUserCount: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { count: 0 } }),
    getUserById: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    getUserLoginHistory: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { history: [] } }),
    deleteUser: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    updateUser: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    getUserBillingHistory: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { payments: [] } }),
  };

  const adminReq = { user: { isAdmin: true, adminId: 'aid' } } as any;
  const nonAdminReq = { user: { userId: 1 } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('should return admin profile for admin request', async () => {
      await controller.getProfile(adminReq);
      expect(service.getAdminProfile).toHaveBeenCalledWith('aid');
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(controller.getProfile(nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should delegate to service', async () => {
      const dto = {
        first_name: 'A',
        last_name: 'B',
        email: 'a@b.com',
        password: 'pass1234',
      };
      await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(
        'A',
        'B',
        'a@b.com',
        'pass1234',
      );
    });
  });

  describe('login', () => {
    it('should delegate to service', async () => {
      await controller.login('e@e.com', 'p');
      expect(service.login).toHaveBeenCalledWith('e@e.com', 'p');
    });
  });

  describe('allUsers', () => {
    it('should return users for admin', async () => {
      await controller.allUsers(adminReq);
      expect(service.getAllUsers).toHaveBeenCalled();
    });

    it('should throw for non-admin', async () => {
      await expect(controller.allUsers(nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('userCount', () => {
    it('should return count for admin', async () => {
      await controller.userCount(adminReq);
      expect(service.getUserCount).toHaveBeenCalled();
    });

    it('should throw for non-admin', async () => {
      await expect(controller.userCount(nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user for admin', async () => {
      await controller.getUserById('1', adminReq);
      expect(service.getUserById).toHaveBeenCalledWith('1');
    });

    it('should throw for non-admin', async () => {
      await expect(controller.getUserById('1', nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserLoginHistory', () => {
    it('should return history for admin', async () => {
      await controller.getUserLoginHistory('1', adminReq);
      expect(service.getUserLoginHistory).toHaveBeenCalledWith('1');
    });

    it('should throw for non-admin', async () => {
      await expect(
        controller.getUserLoginHistory('1', nonAdminReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteUser', () => {
    it('should delete for admin', async () => {
      await controller.deleteUser('1', adminReq);
      expect(service.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should throw for non-admin', async () => {
      await expect(controller.deleteUser('1', nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update for admin', async () => {
      await controller.updateUser('1', { first_name: 'X' }, adminReq);
      expect(service.updateUser).toHaveBeenCalledWith('1', { first_name: 'X' });
    });

    it('should throw for non-admin', async () => {
      await expect(controller.updateUser('1', {}, nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserBillingHistory', () => {
    it('should return billing for admin', async () => {
      await controller.getUserBillingHistory('1', adminReq);
      expect(service.getUserBillingHistory).toHaveBeenCalledWith('1');
    });

    it('should throw for non-admin', async () => {
      await expect(
        controller.getUserBillingHistory('1', nonAdminReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
