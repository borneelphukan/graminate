import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsService } from './receipts.service';
import { ReceiptsRepository } from './receipts.repository';

describe('ReceiptsService', () => {
  let service: ReceiptsService;
  const mockRepo = {
    getReceipts: jest.fn(),
    addReceipt: jest.fn(),
    deleteReceipt: jest.fn(),
    updateReceipt: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        { provide: ReceiptsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<ReceiptsService>(ReceiptsService);
  });

  it('proxies repository calls', async () => {
    mockRepo.getReceipts.mockResolvedValue({ status: 200, data: [] });
    const r = await service.getReceipts(1);
    expect(r.status).toBe(200);
    expect(mockRepo.getReceipts).toHaveBeenCalledWith(1);
  });
});
