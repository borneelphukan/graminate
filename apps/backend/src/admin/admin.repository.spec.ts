import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

import { AdminRepository } from './admin.repository';
import * as argon2 from 'argon2';

const mockAdmin = {
  admin_id: 'admin-uuid',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  password: 'hashed_admin_pass',
};

const prismaMock = {
  admin: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  login_history: {
    findMany: jest.fn(),
  },
  payments: {
    findMany: jest.fn(),
  },
};

describe('AdminRepository', () => {
  let repo: AdminRepository;
  let prisma: typeof prismaMock;
  let jwtService: JwtService;
  let userService: UserService;

  const mockUserService = {
    getAllUsers: jest.fn().mockResolvedValue({ status: 200, data: { users: [] } }),
    getUserCount: jest.fn().mockResolvedValue({ status: 200, data: { count: 0 } }),
    getUserById: jest.fn().mockResolvedValue({ status: 200, data: { user: {} } }),
    deleteUser: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Deleted' } }),
    updateUser: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Updated' } }),
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRepository,
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('admin-jwt') } },
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    repo = module.get<AdminRepository>(AdminRepository);
    prisma = module.get(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAdminProfile', () => {
    it('should return admin profile', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);
      const result = await repo.getAdminProfile('admin-uuid');
      expect(result.status).toBe(200);
      expect(result.data.first_name).toBe('Admin');
    });

    it('should throw UnauthorizedException when admin not found', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);
      await expect(repo.getAdminProfile('bad')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register admin successfully', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.admin.create.mockResolvedValue({
        admin_id: 'new-id',
        first_name: 'New',
        last_name: 'Admin',
        email: 'new@admin.com',
      });

      const result = await repo.register('New', 'Admin', 'new@admin.com', 'pass123');
      expect(result.status).toBe(201);
      expect(result.data.message).toBe('Admin registered');
    });

    it('should throw ConflictException when email exists', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);
      await expect(repo.register('X', 'Y', 'admin@example.com', 'p')).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login admin successfully', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await repo.login('admin@example.com', 'password');
      expect(result.status).toBe(200);
      expect(result.data.access_token).toBe('admin-jwt');
      expect(jwtService.sign).toHaveBeenCalledWith({
        isAdmin: true,
        adminId: 'admin-uuid',
      });
    });

    it('should throw UnauthorizedException when admin not found', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);
      await expect(repo.login('bad@e.com', 'p')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      await expect(repo.login('admin@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('delegation to UserService', () => {
    it('getAllUsers delegates', async () => {
      await repo.getAllUsers();
      expect(userService.getAllUsers).toHaveBeenCalled();
    });

    it('getUserCount delegates', async () => {
      await repo.getUserCount();
      expect(userService.getUserCount).toHaveBeenCalled();
    });

    it('getUserById delegates', async () => {
      await repo.getUserById('1');
      expect(userService.getUserById).toHaveBeenCalledWith('1');
    });

    it('deleteUser delegates', async () => {
      await repo.deleteUser('1');
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });

    it('updateUser delegates', async () => {
      await repo.updateUser('1', { first_name: 'X' });
      expect(userService.updateUser).toHaveBeenCalledWith('1', { first_name: 'X' });
    });
  });

  describe('getUserLoginHistory', () => {
    it('should return formatted history', async () => {
      const loginAt = new Date('2025-01-01T10:00:00Z');
      const logoutAt = new Date('2025-01-01T11:30:45Z');
      prisma.login_history.findMany.mockResolvedValue([
        { logged_in_at: loginAt, logged_out_at: logoutAt },
      ]);

      const result = await repo.getUserLoginHistory('1');
      expect(result.status).toBe(200);
      expect(result.data.history![0].session_duration).toBe('01:30:45');
    });

    it('should handle null logout (still active)', async () => {
      prisma.login_history.findMany.mockResolvedValue([
        { logged_in_at: new Date(), logged_out_at: null },
      ]);
      const result = await repo.getUserLoginHistory('1');
      expect(result.data.history![0].session_duration).toBeNull();
    });

    it('should return 500 on DB error', async () => {
      prisma.login_history.findMany.mockRejectedValue(new Error('fail'));
      const result = await repo.getUserLoginHistory('1');
      expect(result.status).toBe(500);
    });
  });

  describe('getUserBillingHistory', () => {
    it('should return payments', async () => {
      prisma.payments.findMany.mockResolvedValue([{ payment_id: 1 }]);
      const result = await repo.getUserBillingHistory('1');
      expect(result.status).toBe(200);
      expect(result.data.payments).toHaveLength(1);
    });

    it('should return 500 on DB error', async () => {
      prisma.payments.findMany.mockRejectedValue(new Error('fail'));
      const result = await repo.getUserBillingHistory('1');
      expect(result.status).toBe(500);
    });
  });
});
