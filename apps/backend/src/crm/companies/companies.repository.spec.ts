import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesRepository } from './companies.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('CompaniesRepository', () => {
  let repository: CompaniesRepository;
  let prisma: any;

  const mockPrisma = {
    companies: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<CompaniesRepository>(CompaniesRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getCompanies', () => {
    it('filters by userId correctly when passed', async () => {
      mockPrisma.companies.findMany.mockResolvedValue([]);
      const res = await repository.getCompanies('123');
      expect(res.status).toBe(200);
      expect(mockPrisma.companies.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 123 }
      }));
    });

    it('returns 400 for invalid ID', async () => {
      const res = await repository.getCompanies('not-a-number');
      expect(res.status).toBe(400);
    });
  });

  describe('addCompany', () => {
    it('validates regex and returns 400 for mismatch', async () => {
      const res = await repository.addCompany({ 
        user_id: 1, company_name: 'a', contact_person: 'b', email: 'c', 
        phone_number: '123', // short
        type: 'T', address_line_1: 'd', city: 'e', state: 'f', postal_code: '1' // short
      } as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 if company exists', async () => {
      mockPrisma.companies.findFirst.mockResolvedValue({ id: 1 });
      const res = await repository.addCompany({ 
        user_id: 1, company_name: 'X', contact_person: 'X', email: 'e', 
        phone_number: '12345678901', type: 'T', 
        address_line_1: 'd', city: 'c', state: 's', postal_code: '123456'
      } as any);
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('exists');
    });
  });

  describe('deleteCompany', () => {
    it('fails 404 when not existing', async () => {
      mockPrisma.companies.findUnique.mockResolvedValue(null);
      const res = await repository.deleteCompany('999');
      expect(res.status).toBe(404);
    });
  });
});
