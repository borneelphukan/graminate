import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: any;

  const mockService = {
    getContacts: jest.fn(),
    addContact: jest.fn(),
    deleteContact: jest.fn(),
    updateContact: jest.fn(),
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [{ provide: ContactsService, useValue: mockService }],
    }).compile();
    controller = module.get<ContactsController>(ContactsController);
  });

  it('handles parameterized list request', async () => {
    mockService.getContacts.mockResolvedValue({ status: 200, data: {} });
    await controller.getContacts('1', mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
