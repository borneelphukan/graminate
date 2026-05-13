import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';

describe('AdminService', () => {
  let service: AdminService;
  let repo: AdminRepository;

  const mockRepo = {
    getAdminProfile: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    register: jest.fn().mockResolvedValue({ status: 201, data: {} }),
    login: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    getAllUsers: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { users: [] } }),
    getUserCount: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { count: 0 } }),
    getUserById: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    getUserLoginHistory: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { history: [] } }),
    deleteUser: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    updateUser: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    getUserBillingHistory: jest
      .fn()
      .mockResolvedValue({ status: 200, data: { payments: [] } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: AdminRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repo = module.get<AdminRepository>(AdminRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('getAdminProfile delegates', async () => {
    await service.getAdminProfile('id');
    expect(repo.getAdminProfile).toHaveBeenCalledWith('id');
  });

  it('register delegates', async () => {
    await service.register('F', 'L', 'e@e.com', 'p');
    expect(repo.register).toHaveBeenCalledWith('F', 'L', 'e@e.com', 'p');
  });

  it('login delegates', async () => {
    await service.login('e@e.com', 'p');
    expect(repo.login).toHaveBeenCalledWith('e@e.com', 'p');
  });

  it('getAllUsers delegates', async () => {
    await service.getAllUsers();
    expect(repo.getAllUsers).toHaveBeenCalled();
  });

  it('getUserCount delegates', async () => {
    await service.getUserCount();
    expect(repo.getUserCount).toHaveBeenCalled();
  });

  it('getUserById delegates', async () => {
    await service.getUserById('1');
    expect(repo.getUserById).toHaveBeenCalledWith('1');
  });

  it('getUserLoginHistory delegates', async () => {
    await service.getUserLoginHistory('1');
    expect(repo.getUserLoginHistory).toHaveBeenCalledWith('1');
  });

  it('deleteUser delegates', async () => {
    await service.deleteUser('1');
    expect(repo.deleteUser).toHaveBeenCalledWith('1');
  });

  it('updateUser delegates', async () => {
    await service.updateUser('1', { first_name: 'X' });
    expect(repo.updateUser).toHaveBeenCalledWith('1', { first_name: 'X' });
  });

  it('getUserBillingHistory delegates', async () => {
    await service.getUserBillingHistory('1');
    expect(repo.getUserBillingHistory).toHaveBeenCalledWith('1');
  });
});
