import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { ContractsRepository } from './contracts.repository';

describe('ContractsService', () => {
  let service: ContractsService;
  const mockRepo = {
    getContracts: jest.fn(),
    addContract: jest.fn(),
    deleteContract: jest.fn(),
    updateContract: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: ContractsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<ContractsService>(ContractsService);
  });

  it('proxies the repo calls transparently', async () => {
    mockRepo.getContracts.mockResolvedValue({ status: 200, data: [] });
    const res = await service.getContracts();
    expect(res.status).toBe(200);
    expect(mockRepo.getContracts).toHaveBeenCalled();
  });
});
