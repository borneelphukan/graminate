import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { PasswordRepository } from './password.repository';

describe('PasswordService', () => {
  let service: PasswordService;
  let repo: PasswordRepository;

  const mockRepo = {
    handleForgot: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Sent' } }),
    handleReset: jest.fn().mockResolvedValue({ status: 200, data: { message: 'Reset' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: PasswordRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    repo = module.get<PasswordRepository>(PasswordRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('handleForgot delegates to repository', async () => {
    const result = await service.handleForgot('e@e.com');
    expect(result).toEqual({ status: 200, data: { message: 'Sent' } });
    expect(repo.handleForgot).toHaveBeenCalledWith('e@e.com');
  });

  it('handleReset delegates to repository', async () => {
    const body = { email: 'e', token: 't', newPassword: 'p' };
    const result = await service.handleReset(body);
    expect(result).toEqual({ status: 200, data: { message: 'Reset' } });
    expect(repo.handleReset).toHaveBeenCalledWith(body);
  });
});
