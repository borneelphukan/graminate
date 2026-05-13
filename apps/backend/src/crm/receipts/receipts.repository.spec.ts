import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsRepository } from './receipts.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('ReceiptsRepository', () => {
  let repository: ReceiptsRepository;

  const mockPrisma: any = {
    invoices: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    sales: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    repository = module.get<ReceiptsRepository>(ReceiptsRepository);
  });

  it('fetches receipts with related items mapped', async () => {
    mockPrisma.invoices.findMany.mockResolvedValue([
      { invoice_id: 1, invoice_items: [{ id: 5 }] },
    ]);
    const res = await repository.getReceipts(1);
    expect(res.status).toBe(200);
    expect(res.data.receipts![0].items).toEqual([{ id: 5 }]);
  });

  it('processes transaction addReceipt pipeline', async () => {
    mockPrisma.invoices.create.mockResolvedValue({ invoice_id: 99 });
    const res = await repository.addReceipt({
      user_id: 1,
      title: 'Inv',
      bill_to: 'User',
      due_date: '2025',
      items: [{ description: 'A', quantity: 1, rate: 10 }],
    } as any);
    expect(res.status).toBe(201);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.invoices.create).toHaveBeenCalled();
  });
});
