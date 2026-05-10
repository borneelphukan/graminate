import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

describe('ReceiptsController', () => {
  let controller: ReceiptsController;
  const mockService = {
    getReceipts: jest.fn(),
    addReceipt: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [{ provide: ReceiptsService, useValue: mockService }],
    }).compile();
    controller = module.get<ReceiptsController>(ReceiptsController);
  });

  it('forwards the request to user scope getter', async () => {
    mockService.getReceipts.mockResolvedValue({ status: 200, data: [] });
    await controller.getReceipts(1, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
