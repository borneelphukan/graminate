import { Test, TestingModule } from '@nestjs/testing';
import { OtpRepository } from './otp.repository';
import { otpStore } from '@/stores/store';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('mjml', () => jest.fn().mockReturnValue({ html: '<p>OTP</p>' }));

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('<mjml>{{otpDigits}}</mjml>'),
}));

describe('OtpRepository', () => {
  let repo: OtpRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpRepository],
    }).compile();

    repo = module.get<OtpRepository>(OtpRepository);
    Object.keys(otpStore).forEach((key) => delete otpStore[key]);
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const result = await repo.sendOtp('test@example.com');
      expect(result.status).toBe(200);
      expect(result.data.message).toBe('OTP sent successfully.');
      expect(otpStore['test@example.com']).toBeDefined();
      expect(otpStore['test@example.com']).toHaveLength(6);
    });

    it('should return 400 for missing email', async () => {
      const result = await repo.sendOtp('');
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Valid email is required');
    });

    it('should return 400 for non-string email', async () => {
      const result = await repo.sendOtp(undefined as any);
      expect(result.status).toBe(400);
    });
  });

  describe('verifyOtp', () => {
    it('should verify correct OTP', async () => {
      otpStore['test@example.com'] = '123456';
      const result = await repo.verifyOtp('test@example.com', '123456');
      expect(result.status).toBe(200);
      expect(result.data.success).toBe(true);
      expect(otpStore['test@example.com']).toBeUndefined();
    });

    it('should reject wrong OTP', async () => {
      otpStore['test@example.com'] = '123456';
      const result = await repo.verifyOtp('test@example.com', '000000');
      expect(result.status).toBe(400);
      expect(result.data.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const result = await repo.verifyOtp('', '');
      expect(result.status).toBe(400);
      expect(result.data.message).toBe('Email and OTP are required');
    });

    it('should reject OTP for unknown email', async () => {
      const result = await repo.verifyOtp('unknown@example.com', '123456');
      expect(result.status).toBe(400);
      expect(result.data.success).toBe(false);
    });
  });
});
