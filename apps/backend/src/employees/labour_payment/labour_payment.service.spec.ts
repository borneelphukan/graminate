import { Test, TestingModule } from '@nestjs/testing';
import { LabourPaymentService } from './labour_payment.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('LabourPaymentService', () => {
  let service: LabourPaymentService;
  const mockPrisma = {
    labour_payments: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabourPaymentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<LabourPaymentService>(LabourPaymentService);
  });

  it('resolves empty array gracefully when fetch has no hits', async () => {
    mockPrisma.labour_payments.findMany.mockResolvedValue([]);
    const res = await service.getPayments('1');
    expect(res.status).toBe(404);
  });
});
