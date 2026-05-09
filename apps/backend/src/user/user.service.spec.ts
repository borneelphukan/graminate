import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let service: UserService;
  let repo: UserRepository;

  const mockRepo = {
    getUserCount: jest.fn().mockResolvedValue({ status: 200, data: { count: 5 } }),
    getAllUsers: jest.fn().mockResolvedValue({ status: 200, data: { users: [] } }),
    getAvailableSubTypes: jest.fn().mockResolvedValue({ status: 200, data: { subTypes: [] } }),
    getUserById: jest.fn().mockResolvedValue({ status: 200, data: { user: {} } }),
    updateUser: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Updated' } }),
    logout: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Done' } }),
    validateUser: jest.fn().mockResolvedValue({ user_id: 1 }),
    registerUser: jest.fn().mockResolvedValue({ status: 201, data: { message: 'OK' } }),
    deleteUser: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Deleted' } }),
    verifyPassword: jest.fn().mockResolvedValue({ status: 200, data: { valid: true } }),
    scheduleDowngrade: jest.fn().mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    getBillingHistory: jest.fn().mockResolvedValue({ status: 200, data: { payments: [] } }),
    getNotifications: jest.fn().mockResolvedValue({ status: 200, data: { notifications: [] } }),
    markNotificationsRead: jest.fn().mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    deleteNotification: jest.fn().mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    clearAllNotifications: jest.fn().mockResolvedValue({ status: 200, data: { message: 'OK' } }),
    findByEmail: jest.fn().mockResolvedValue({ user_id: 1 }),
    createNotification: jest.fn().mockResolvedValue({ status: 201, data: { message: 'OK' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('getUserCount delegates', async () => {
    await service.getUserCount();
    expect(repo.getUserCount).toHaveBeenCalled();
  });

  it('getAllUsers delegates', async () => {
    await service.getAllUsers();
    expect(repo.getAllUsers).toHaveBeenCalled();
  });

  it('getAvailableSubTypes delegates', async () => {
    await service.getAvailableSubTypes('1');
    expect(repo.getAvailableSubTypes).toHaveBeenCalledWith('1');
  });

  it('getUserById delegates', async () => {
    await service.getUserById('1');
    expect(repo.getUserById).toHaveBeenCalledWith('1');
  });

  it('updateUser delegates', async () => {
    await service.updateUser('1', { first_name: 'X' });
    expect(repo.updateUser).toHaveBeenCalledWith('1', { first_name: 'X' });
  });

  it('logout delegates', async () => {
    await service.logout('lid');
    expect(repo.logout).toHaveBeenCalledWith('lid');
  });

  it('validateUser delegates', async () => {
    await service.validateUser('e', 'p');
    expect(repo.validateUser).toHaveBeenCalledWith('e', 'p');
  });

  it('registerUser delegates', async () => {
    await service.registerUser({ first_name: 'J' });
    expect(repo.registerUser).toHaveBeenCalledWith({ first_name: 'J' });
  });

  it('deleteUser delegates', async () => {
    await service.deleteUser('1');
    expect(repo.deleteUser).toHaveBeenCalledWith('1');
  });

  it('verifyPassword delegates', async () => {
    await service.verifyPassword('1', 'p');
    expect(repo.verifyPassword).toHaveBeenCalledWith('1', 'p');
  });

  it('scheduleDowngrade delegates', async () => {
    await service.scheduleDowngrade('1', 'FREE');
    expect(repo.scheduleDowngrade).toHaveBeenCalledWith('1', 'FREE');
  });

  it('getBillingHistory delegates', async () => {
    await service.getBillingHistory('1');
    expect(repo.getBillingHistory).toHaveBeenCalledWith('1');
  });

  it('getNotifications delegates', async () => {
    await service.getNotifications('1');
    expect(repo.getNotifications).toHaveBeenCalledWith('1');
  });

  it('markNotificationsRead delegates', async () => {
    await service.markNotificationsRead('1', 5);
    expect(repo.markNotificationsRead).toHaveBeenCalledWith('1', 5);
  });

  it('deleteNotification delegates', async () => {
    await service.deleteNotification('1', 5);
    expect(repo.deleteNotification).toHaveBeenCalledWith('1', 5);
  });

  it('clearAllNotifications delegates', async () => {
    await service.clearAllNotifications('1');
    expect(repo.clearAllNotifications).toHaveBeenCalledWith('1');
  });

  it('findByEmail delegates', async () => {
    await service.findByEmail('e@e.com');
    expect(repo.findByEmail).toHaveBeenCalledWith('e@e.com');
  });

  it('createNotification delegates', async () => {
    await service.createNotification('1', { title: 'T', message: 'M' });
    expect(repo.createNotification).toHaveBeenCalledWith('1', { title: 'T', message: 'M' });
  });
});
