jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test_123', amount: 500 }),
    }
  }));
});

import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  const mockPrisma = {
    payments: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.RAZORPAY_KEY_ID = 'fake_id';
    process.env.RAZORPAY_KEY_SECRET = 'fake_secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentRepository, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  afterEach(() => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it('attempts external order create call during createOrder routine', async () => {
    mockPrisma.payments.create.mockResolvedValue({});
    const order = await repository.createOrder({
      amount: 5, currency: 'INR', userId: 1, planType: 'BASIC'
    });
    expect(order.id).toBe('order_test_123');
  });
});
