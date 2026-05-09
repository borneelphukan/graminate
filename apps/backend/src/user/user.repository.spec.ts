import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';
import { PrismaService } from '@/prisma/prisma.service';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockUser = {
  user_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '1234567890',
  business_name: 'Farm Co',
  password: 'hashed_password',
  language: 'English',
  time_format: '24-hour',
  temperature_scale: 'Celsius',
  type: 'Producer',
  sub_type: ['Poultry'],
  address_line_1: '123 St',
  address_line_2: '',
  city: 'Farmville',
  state: 'VA',
  postal_code: '12345',
  country: 'US',
  darkMode: false,
  widgets: ['Task Calendar'],
  plan: 'FREE',
  subscription_expires_at: null,
  opening_balance: null,
  entity_type: null,
  business_size: null,
  pending_plan: null,
  pending_plan_source: null,
  date_of_birth: null,
  created_at: new Date('2025-01-01'),
};

const prismaMock = {
  users: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  login_history: {
    update: jest.fn(),
  },
  notifications: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  payments: {
    findMany: jest.fn(),
  },
  password_resets: {},
};

describe('UserRepository', () => {
  let repo: UserRepository;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repo = module.get<UserRepository>(UserRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUserCount', () => {
    it('should return count on success', async () => {
      prisma.users.count.mockResolvedValue(5);
      const result = await repo.getUserCount();
      expect(result).toEqual({ status: 200, data: { count: 5 } });
    });

    it('should return 500 on DB error', async () => {
      prisma.users.count.mockRejectedValue(new Error('DB fail'));
      const result = await repo.getUserCount();
      expect(result.status).toBe(500);
      expect(result.data.error).toBeDefined();
    });
  });

  describe('getAllUsers', () => {
    it('should return users with is_subscription_active flag', async () => {
      prisma.users.findMany.mockResolvedValue([
        { ...mockUser, plan: 'PRO', subscription_expires_at: new Date(Date.now() + 86400000) },
        { ...mockUser, user_id: 2, plan: 'FREE', subscription_expires_at: null },
      ]);
      const result = await repo.getAllUsers();
      expect(result.status).toBe(200);
      expect(result.data.users).toHaveLength(2);
      expect(result.data.users[0].is_subscription_active).toBe(true);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      prisma.users.findMany.mockRejectedValue(new Error('DB fail'));
      await expect(repo.getAllUsers()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAvailableSubTypes', () => {
    it('should return sub-types for Producer', async () => {
      prisma.users.findUnique.mockResolvedValue({ type: 'Producer' });
      const result = await repo.getAvailableSubTypes('1');
      expect(result.status).toBe(200);
      expect(result.data.subTypes).toEqual(['Poultry', 'Cattle Rearing', 'Apiculture', 'Floriculture']);
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.getAvailableSubTypes('999');
      expect(result.status).toBe(404);
    });

    it('should return empty array for unknown type', async () => {
      prisma.users.findUnique.mockResolvedValue({ type: 'Unknown' });
      const result = await repo.getAvailableSubTypes('1');
      expect(result.data.subTypes).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return user data on success', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      const result = await repo.getUserById('1');
      expect(result.status).toBe(200);
      expect(result.data.user.user_id).toBe(1);
      expect(result.data.user.first_name).toBe('John');
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.getUserById('999');
      expect(result.status).toBe(404);
    });

    it('should return 400 for invalid user ID', async () => {
      const result = await repo.getUserById('abc');
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Invalid user ID');
    });

    it('should apply pending plan downgrade when subscription expired', async () => {
      const expiredUser = {
        ...mockUser,
        plan: 'PRO',
        pending_plan: 'FREE',
        subscription_expires_at: new Date(Date.now() - 86400000),
      };
      prisma.users.findUnique.mockResolvedValue(expiredUser);
      prisma.users.update.mockResolvedValue({
        ...expiredUser,
        plan: 'FREE',
        pending_plan: null,
        pending_plan_source: null,
        subscription_expires_at: null,
      });

      const result = await repo.getUserById('1');
      expect(result.status).toBe(200);
      expect(prisma.users.update).toHaveBeenCalled();
    });
  });

  describe('registerUser', () => {
    const registerBody = {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      phone_number: '0987654321',
      password: 'securePass',
    };

    it('should register user successfully', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.users.create.mockResolvedValue({
        user_id: 2,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone_number: '0987654321',
        business_name: null,
        type: null,
        plan: 'FREE',
        subscription_expires_at: null,
        darkMode: false,
        widgets: ['Task Calendar'],
        address_line_1: null,
        address_line_2: null,
        city: null,
        state: null,
        postal_code: null,
        country: null,
        entity_type: null,
        business_size: null,
      });

      const result = await repo.registerUser(registerBody);
      expect(result.status).toBe(201);
      expect(result.data.message).toBe('User registered successfully');
      expect(result.data.user).toBeDefined();
    });

    it('should return 400 when required fields are missing', async () => {
      const result = await repo.registerUser({ first_name: 'Jane' });
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Missing required fields');
    });

    it('should return 409 when email or phone already exists', async () => {
      prisma.users.findFirst.mockResolvedValue(mockUser);
      const result = await repo.registerUser(registerBody);
      expect(result.status).toBe(409);
    });

    it('should throw InternalServerErrorException on DB error during create', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.users.create.mockRejectedValue(new Error('DB fail'));

      await expect(repo.registerUser(registerBody)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      prisma.users.update.mockResolvedValue({});

      const result = await repo.updateUser('1', { first_name: 'Updated' });
      expect(result.status).toBe(200);
      expect(result.data.message).toBe('User updated successfully');
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.updateUser('999', { first_name: 'X' });
      expect(result.status).toBe(404);
    });

    it('should return 400 when no fields to update', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      const result = await repo.updateUser('1', {});
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('No fields to update');
    });

    it('should filter invalid sub_types', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      prisma.users.update.mockResolvedValue({});

      await repo.updateUser('1', { sub_type: ['Poultry', 'InvalidType'] as any });
      const updateCall = prisma.users.update.mock.calls[0][0];
      expect(updateCall.data.sub_type).toEqual(['Poultry']);
    });

    it('should create admin notification when pending_plan_source is ADMIN', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      prisma.users.update.mockResolvedValue({});
      prisma.notifications.deleteMany.mockResolvedValue({});
      prisma.notifications.create.mockResolvedValue({});

      await repo.updateUser('1', {
        plan: 'PRO' as any,
        pending_plan_source: 'ADMIN' as any,
        admin_reason: 'Upgraded by admin',
        admin_action: 'Allow Pro Access',
      });

      expect(prisma.notifications.create).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      prisma.users.delete.mockResolvedValue({});

      const result = await repo.deleteUser('1');
      expect(result.status).toBe(200);
      expect(result.data.message).toBe('User deleted successfully');
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.deleteUser('999');
      expect(result.status).toBe(404);
    });

    it('should return 500 on DB error', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      prisma.users.delete.mockRejectedValue(new Error('DB fail'));
      const result = await repo.deleteUser('1');
      expect(result.status).toBe(500);
    });
  });

  describe('validateUser', () => {
    it('should return user on valid credentials', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await repo.validateUser('john@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw on invalid email', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      await expect(repo.validateUser('bad@example.com', 'pass')).rejects.toThrow('Invalid email or password');
    });

    it('should throw on invalid password', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      await expect(repo.validateUser('john@example.com', 'wrong')).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyPassword', () => {
    it('should return valid true for correct password', async () => {
      prisma.users.findUnique.mockResolvedValue({ password: 'hashed' });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await repo.verifyPassword('1', 'correctPass');
      expect(result.status).toBe(200);
      expect(result.data.valid).toBe(true);
    });

    it('should return valid false for wrong password', async () => {
      prisma.users.findUnique.mockResolvedValue({ password: 'hashed' });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await repo.verifyPassword('1', 'wrongPass');
      expect(result.status).toBe(401);
      expect(result.data.valid).toBe(false);
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.verifyPassword('999', 'pass');
      expect(result.status).toBe(404);
    });
  });

  describe('logout', () => {
    it('should log out successfully', async () => {
      prisma.login_history.update.mockResolvedValue({});
      const result = await repo.logout('login-id');
      expect(result.status).toBe(200);
      expect(result.data.message).toBe('Logged out successfully');
    });

    it('should return 500 on DB error', async () => {
      prisma.login_history.update.mockRejectedValue(new Error('fail'));
      const result = await repo.logout('bad-id');
      expect(result.status).toBe(500);
    });
  });

  describe('scheduleDowngrade', () => {
    it('should schedule downgrade from PRO to FREE', async () => {
      prisma.users.findUnique.mockResolvedValue({ plan: 'PRO', subscription_expires_at: new Date(Date.now() + 86400000) });
      prisma.users.update.mockResolvedValue({});

      const result = await repo.scheduleDowngrade('1', 'FREE');
      expect(result.status).toBe(200);
      expect(result.data.message).toContain('Free');
    });

    it('should reject upgrade or same-level plan', async () => {
      prisma.users.findUnique.mockResolvedValue({ plan: 'FREE', subscription_expires_at: null });
      const result = await repo.scheduleDowngrade('1', 'PRO');
      expect(result.status).toBe(400);
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.scheduleDowngrade('999', 'FREE');
      expect(result.status).toBe(404);
    });
  });

  describe('getBillingHistory', () => {
    it('should return payment records', async () => {
      prisma.payments.findMany.mockResolvedValue([{ payment_id: 1 }]);
      const result = await repo.getBillingHistory('1');
      expect(result.status).toBe(200);
      expect(result.data.payments).toHaveLength(1);
    });

    it('should return 500 on DB error', async () => {
      prisma.payments.findMany.mockRejectedValue(new Error('fail'));
      const result = await repo.getBillingHistory('1');
      expect(result.status).toBe(500);
    });
  });

  describe('getNotifications', () => {
    it('should return notifications', async () => {
      prisma.notifications.findMany.mockResolvedValue([{ notification_id: 1, title: 'Test' }]);
      const result = await repo.getNotifications('1');
      expect(result.status).toBe(200);
      expect(result.data.notifications).toHaveLength(1);
    });
  });

  describe('markNotificationsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prisma.notifications.updateMany.mockResolvedValue({ count: 3 });
      const result = await repo.markNotificationsRead('1');
      expect(result.status).toBe(200);
    });

    it('should mark a single notification as read', async () => {
      prisma.notifications.updateMany.mockResolvedValue({ count: 1 });
      const result = await repo.markNotificationsRead('1', 5);
      expect(result.status).toBe(200);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      prisma.notifications.delete.mockResolvedValue({});
      const result = await repo.deleteNotification('1', 5);
      expect(result.status).toBe(200);
    });
  });

  describe('clearAllNotifications', () => {
    it('should clear all notifications', async () => {
      prisma.notifications.deleteMany.mockResolvedValue({ count: 10 });
      const result = await repo.clearAllNotifications('1');
      expect(result.status).toBe(200);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      prisma.users.findUnique.mockResolvedValue(mockUser);
      const result = await repo.findByEmail('john@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await repo.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      prisma.notifications.create.mockResolvedValue({});
      const result = await repo.createNotification('1', { title: 'Test', message: 'Hello' });
      expect(result.status).toBe(201);
    });
  });
});
