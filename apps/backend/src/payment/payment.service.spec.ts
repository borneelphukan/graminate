import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';

describe('PaymentService', () => {
  let service: PaymentService;
  const mockRepo = {
    createOrder: jest.fn(),
    verifyPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<PaymentService>(PaymentService);
  });

  it('proxies repo createOrder faithfully', async () => {
    mockRepo.createOrder.mockResolvedValue({ id: '123' });
    const res = await service.createOrder({} as any);
    expect(res.id).toBe('123');
  });
});
