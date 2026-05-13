import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { OtpRepository } from './otp.repository';

describe('OtpService', () => {
  let service: OtpService;
  let repo: OtpRepository;

  const mockRepo = {
    sendOtp: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { message: 'Sent' } }),
    verifyOtp: jest.fn().mockResolvedValue({
      status: 200,
      data: { success: true, message: 'OK' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService, { provide: OtpRepository, useValue: mockRepo }],
    }).compile();

    service = module.get<OtpService>(OtpService);
    repo = module.get<OtpRepository>(OtpRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('sendOtp delegates to repository', async () => {
    const result = await service.sendOtp('e@e.com');
    expect(result).toEqual({ status: 200, data: { message: 'Sent' } });
    expect(repo.sendOtp).toHaveBeenCalledWith('e@e.com');
  });

  it('verifyOtp delegates to repository', async () => {
    const result = await service.verifyOtp('e@e.com', '123456');
    expect(result).toEqual({
      status: 200,
      data: { success: true, message: 'OK' },
    });
    expect(repo.verifyOtp).toHaveBeenCalledWith('e@e.com', '123456');
  });
});
