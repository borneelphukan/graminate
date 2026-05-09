import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

describe('OtpController', () => {
  let controller: OtpController;
  let service: OtpService;

  const mockService = {
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [{ provide: OtpService, useValue: mockService }],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    service = module.get<OtpService>(OtpService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('sendOtp', () => {
    it('should call service and respond with correct status', async () => {
      mockService.sendOtp.mockResolvedValue({ status: 200, data: { message: 'Sent' } });
      const res = mockRes();

      await controller.sendOtp({ email: 'test@e.com' }, res);

      expect(service.sendOtp).toHaveBeenCalledWith('test@e.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sent' });
    });
  });

  describe('verifyOtp', () => {
    it('should call service and respond with correct status', async () => {
      mockService.verifyOtp.mockResolvedValue({ status: 200, data: { success: true, message: 'OK' } });
      const res = mockRes();

      await controller.verifyOtp({ email: 'test@e.com', otp: '123456' }, res);

      expect(service.verifyOtp).toHaveBeenCalledWith('test@e.com', '123456');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OK' });
    });
  });
});
