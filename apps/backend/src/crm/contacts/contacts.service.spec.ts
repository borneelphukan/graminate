import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { ContactsRepository } from './contacts.repository';

describe('ContactsService', () => {
  let service: ContactsService;
  let repository: any;

  const mockRepo = {
    getContacts: jest.fn(),
    addContact: jest.fn(),
    deleteContact: jest.fn(),
    updateContact: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: ContactsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<ContactsService>(ContactsService);
  });

  it('delegates calls to repo handler', async () => {
    mockRepo.getContacts.mockResolvedValue({ status: 200, data: [] });
    const r = await service.getContacts('1');
    expect(r.status).toBe(200);
    expect(mockRepo.getContacts).toHaveBeenCalled();
  });
});
