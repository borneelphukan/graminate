import { Test, TestingModule } from '@nestjs/testing';
import { ContactsRepository } from './contacts.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('ContactsRepository', () => {
  let repository: ContactsRepository;
  let prisma: any;

  const mockPrisma = {
    contacts: {
      findMany: jest.fn(),
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
        ContactsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    repository = module.get<ContactsRepository>(ContactsRepository);
  });

  describe('getContacts', () => {
    it('filters by userId', async () => {
      mockPrisma.contacts.findMany.mockResolvedValue([]);
      const res = await repository.getContacts('5');
      expect(res.status).toBe(200);
      expect(mockPrisma.contacts.findMany).toHaveBeenCalled();
    });
  });

  describe('addContact', () => {
    it('creates record when validated successfully', async () => {
      mockPrisma.contacts.create.mockResolvedValue({ contact_id: 1 });
      const res = await repository.addContact({
        user_id: 1,
        first_name: 'Jane',
        phone_number: '1234567890',
        type: 'Lead',
        address_line_1: 'addr',
        city: 'city',
        state: 'state',
        postal_code: '123',
      } as any);
      expect(res.status).toBe(201);
    });
  });
});
