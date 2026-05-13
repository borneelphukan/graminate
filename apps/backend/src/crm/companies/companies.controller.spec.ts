import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: any;

  const mockService = {
    getCompanies: jest.fn(),
    addCompany: jest.fn(),
    deleteCompany: jest.fn(),
    updateCompany: jest.fn(),
    resetTable: jest.fn(),
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: mockService }],
    }).compile();
    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
  });

  it('executes response format delegation on fetch', async () => {
    mockService.getCompanies.mockResolvedValue({
      status: 200,
      data: { val: 'ok' },
    });
    await controller.getCompanies('5', mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ val: 'ok' });
  });

  it('handles bulk retrieval via queries', async () => {
    mockService.getCompanies.mockResolvedValue({ status: 200, data: [] });
    await controller.getAllCompanies(mockRes, '10', '0');
    expect(mockService.getCompanies).toHaveBeenCalledWith(undefined, 10, 0);
  });
});
