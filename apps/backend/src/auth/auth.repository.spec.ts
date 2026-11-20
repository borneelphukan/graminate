import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { UserService } from '../user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { OtpService } from '@/otp/otp.service';
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
};

describe('AuthRepository', () => {
  let repo: AuthRepository;
  let userService: UserService;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let otpService: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt_token'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            login_history: {
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: OtpService,
          useValue: {
            sendOtp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<AuthRepository>(AuthRepository);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    otpService = module.get<OtpService>(OtpService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await repo.validateUser('john@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(argon2.verify).toHaveBeenCalledWith('hashed_password', 'password');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        repo.validateUser('unknown@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        repo.validateUser('john@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should send OTP and return login_id on success', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (prisma.login_history.create as jest.Mock).mockResolvedValue({
        login_id: 'login-uuid-123',
      });
      (otpService.sendOtp as jest.Mock).mockResolvedValue({
        status: 200,
        data: { message: 'OTP sent successfully.' },
      });

      const result = await repo.login('john@example.com', 'password');

      expect(result).toEqual({
        success: true,
        login_id: 'login-uuid-123',
        message: 'OTP sent successfully. Please verify to complete login.',
        user: {
          user_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
      });
      expect(prisma.login_history.create).toHaveBeenCalledWith({
        data: { user_id: 1 },
        select: { login_id: true },
      });
      expect(otpService.sendOtp).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw error when OTP sending fails', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (prisma.login_history.create as jest.Mock).mockResolvedValue({
        login_id: 'login-uuid-123',
      });
      (otpService.sendOtp as jest.Mock).mockResolvedValue({
        status: 500,
        data: { error: 'Email service unavailable' },
      });

      await expect(repo.login('john@example.com', 'password')).rejects.toThrow(
        'Failed to send OTP: Email service unavailable',
      );
    });

    it('should propagate UnauthorizedException from validateUser', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(repo.login('bad@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('loginVerify', () => {
    it('should verify OTP and return access_token on success', async () => {
      (otpService.verifyOtp as jest.Mock).mockResolvedValue({
        status: 200,
        data: { success: true, message: 'OTP verified successfully' },
      });
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (prisma.login_history.update as jest.Mock).mockResolvedValue({});

      const result = await repo.loginVerify(
        'john@example.com',
        '123456',
        'login-uuid-123',
      );

      expect(result).toEqual({
        access_token: 'jwt_token',
        login_id: 'login-uuid-123',
        user: {
          user_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone_number: '1234567890',
          business_name: 'Farm Co',
        },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        'john@example.com',
        '123456',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: 1 });
      expect(prisma.login_history.update).toHaveBeenCalledWith({
        where: { login_id: 'login-uuid-123' },
        data: { logged_in_at: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException when OTP is invalid', async () => {
      (otpService.verifyOtp as jest.Mock).mockResolvedValue({
        status: 400,
        data: { success: false, message: 'Invalid OTP' },
      });

      await expect(
        repo.loginVerify('john@example.com', 'wrong', 'login-uuid-123'),
      ).rejects.toThrow(new UnauthorizedException('Invalid OTP'));
    });

    it('should throw UnauthorizedException when user not found after OTP verification', async () => {
      (otpService.verifyOtp as jest.Mock).mockResolvedValue({
        status: 200,
        data: { success: true, message: 'OTP verified successfully' },
      });
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        repo.loginVerify('john@example.com', '123456', 'login-uuid-123'),
      ).rejects.toThrow(new UnauthorizedException('User not found'));
    });
  });
});
