import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

describe('ContractsController', () => {
  let controller: ContractsController;
  const mockService = {
    getContracts: jest.fn(),
    addContract: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [{ provide: ContractsService, useValue: mockService }],
    }).compile();
    controller = module.get<ContractsController>(ContractsController);
  });

  it('forwards parameters to service for fetch', async () => {
    mockService.getContracts.mockResolvedValue({ status: 200, data: {} });
    await controller.getContractsByUserId(1, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
