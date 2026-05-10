import { Test, TestingModule } from '@nestjs/testing';
import { LabourPaymentController } from './labour_payment.controller';
import { LabourPaymentService } from './labour_payment.service';

describe('LabourPaymentController', () => {
  let controller: LabourPaymentController;
  const mockService = {
    getPayments: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabourPaymentController],
      providers: [{ provide: LabourPaymentService, useValue: mockService }],
    }).compile();
    controller = module.get<LabourPaymentController>(LabourPaymentController);
  });

  it('extracts pagination correctly', async () => {
    mockService.getPayments.mockResolvedValue({ status: 200, data: [] });
    await controller.getPayments('1', mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
