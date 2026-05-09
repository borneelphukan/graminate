import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';

const mockHash = jest.fn();
const mockVerify = jest.fn();

jest.mock('argon2', () => ({
  hash: mockHash,
  verify: mockVerify,
  argon2id: 2,
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('mjml', () => jest.fn().mockReturnValue({ html: '<p>Reset</p>' }));

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('<mjml>{{firstName}}{{resetLink}}</mjml>'),
}));

jest.mock('path', () => ({
  resolve: jest.fn().mockReturnValue('/mocked/path/resetPasswordEmail.mjml'),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-reset-token'),
  }),
}));

import { PasswordRepository } from './password.repository';

const prismaMock = {
  users: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  password_resets: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PasswordRepository', () => {
  let repo: PasswordRepository;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repo = module.get<PasswordRepository>(PasswordRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('handleForgot', () => {
    it('should send reset email successfully', async () => {
      prisma.users.findFirst.mockResolvedValue({ first_name: 'John' });
      mockHash.mockResolvedValue('hashed-token');
      prisma.password_resets.upsert.mockResolvedValue({});

      const result = await repo.handleForgot('john@example.com');
      expect(result.status).toBe(200);
      expect(result.data.message).toBe('Password reset link sent to email.');
    });

    it('should return 400 for missing email', async () => {
      const result = await repo.handleForgot('');
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Email is required');
    });

    it('should return 404 when user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      const result = await repo.handleForgot('nobody@example.com');
      expect(result.status).toBe(404);
    });
  });

  describe('handleReset', () => {
    it('should reset password successfully', async () => {
      prisma.password_resets.findUnique.mockResolvedValue({
        token: 'stored-hash',
        expires_at: new Date(Date.now() + 3600000),
      });
      mockVerify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      prisma.users.findUnique.mockResolvedValue({ password: 'old-hash' });
      mockHash.mockResolvedValue('new-hash');
      prisma.users.update.mockResolvedValue({});
      prisma.password_resets.delete.mockResolvedValue({});

      const result = await repo.handleReset({
        email: 'john@example.com',
        token: 'valid-token',
        newPassword: 'newPass123',
      });
      expect(result.status).toBe(200);
      expect(result.data.message).toBe('Password successfully reset');
    });

    it('should return 400 for missing fields', async () => {
      const result = await repo.handleReset({ email: 'test@e.com' });
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Invalid request');
    });

    it('should return 400 when no reset record found', async () => {
      prisma.password_resets.findUnique.mockResolvedValue(null);
      const result = await repo.handleReset({
        email: 'john@example.com',
        token: 'tok',
        newPassword: 'new',
      });
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Invalid token');
    });

    it('should return 400 when token expired', async () => {
      prisma.password_resets.findUnique.mockResolvedValue({
        token: 'hash',
        expires_at: new Date(Date.now() - 3600000),
      });
      const result = await repo.handleReset({
        email: 'john@example.com',
        token: 'tok',
        newPassword: 'new',
      });
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Token expired');
    });

    it('should return 400 when token does not match', async () => {
      prisma.password_resets.findUnique.mockResolvedValue({
        token: 'hash',
        expires_at: new Date(Date.now() + 3600000),
      });
      mockVerify.mockResolvedValueOnce(false);
      const result = await repo.handleReset({
        email: 'john@example.com',
        token: 'bad-token',
        newPassword: 'new',
      });
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Invalid token');
    });

    it('should return 400 when new password matches old', async () => {
      prisma.password_resets.findUnique.mockResolvedValue({
        token: 'hash',
        expires_at: new Date(Date.now() + 3600000),
      });
      mockVerify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      prisma.users.findUnique.mockResolvedValue({ password: 'old-hash' });

      const result = await repo.handleReset({
        email: 'john@example.com',
        token: 'tok',
        newPassword: 'sameOldPass',
      });
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Please enter a different password');
    });

    it('should return 404 when user not found during reset', async () => {
      prisma.password_resets.findUnique.mockResolvedValue({
        token: 'hash',
        expires_at: new Date(Date.now() + 3600000),
      });
      mockVerify.mockResolvedValueOnce(true);
      prisma.users.findUnique.mockResolvedValue(null);

      const result = await repo.handleReset({
        email: 'gone@example.com',
        token: 'tok',
        newPassword: 'new',
      });
      expect(result.status).toBe(404);
    });
  });
});
