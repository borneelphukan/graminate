import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;
  const mockService = {
    findByUserId: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: mockService }],
    }).compile();
    controller = module.get<SalesController>(SalesController);
  });

  it('triggers correct handler method pass-through mapping', async () => {
    mockService.findByUserId.mockResolvedValue([]);
    const res = await controller.getByUserId(1);
    expect(res).toEqual({ sales: [] });
  });
});
