import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;
  const mockService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [{ provide: PaymentService, useValue: mockService }],
    }).compile();
    controller = module.get<PaymentController>(PaymentController);
  });

  it('delegates endpoint hit to createOrder service method', async () => {
    mockService.createOrder.mockResolvedValue({ payload: 'data' });
    const res = await controller.createOrder({} as any);
    expect(res.payload).toBe('data');
  });
});
