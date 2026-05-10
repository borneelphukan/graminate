import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from './companies.repository';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: any;

  const mockRepo = {
    getCompanies: jest.fn(),
    addCompany: jest.fn(),
    deleteCompany: jest.fn(),
    updateCompany: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: CompaniesRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get<CompaniesRepository>(CompaniesRepository);
  });

  it('delegates calls to repository straightforwardly', async () => {
    mockRepo.getCompanies.mockResolvedValue({ status: 200, data: {} });
    await service.getCompanies('1');
    expect(mockRepo.getCompanies).toHaveBeenCalledWith('1', undefined, undefined);
    
    mockRepo.addCompany.mockResolvedValue({ status: 201, data: {} });
    await service.addCompany({ company_name: 'test' } as any);
    expect(mockRepo.addCompany).toHaveBeenCalled();
  });
});
