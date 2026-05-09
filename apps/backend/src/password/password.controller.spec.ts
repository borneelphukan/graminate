import { Test, TestingModule } from '@nestjs/testing';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';

describe('PasswordController', () => {
  let controller: PasswordController;
  let service: PasswordService;

  const mockService = {
    handleForgot: jest.fn(),
    handleReset: jest.fn(),
  };

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordController],
      providers: [{ provide: PasswordService, useValue: mockService }],
    }).compile();

    controller = module.get<PasswordController>(PasswordController);
    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('forgotPassword', () => {
    it('should call service and respond with correct status', async () => {
      mockService.handleForgot.mockResolvedValue({ status: 200, data: { message: 'Sent' } });
      const res = mockRes();

      await controller.forgotPassword({ email: 'test@e.com' }, res);

      expect(service.handleForgot).toHaveBeenCalledWith('test@e.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sent' });
    });
  });

  describe('resetPassword', () => {
    it('should call service and respond with correct status', async () => {
      mockService.handleReset.mockResolvedValue({ status: 200, data: { message: 'Done' } });
      const res = mockRes();
      const body = { email: 'e', token: 't', newPassword: 'p' };

      await controller.resetPassword(body, res);

      expect(service.handleReset).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Done' });
    });
  });
});
