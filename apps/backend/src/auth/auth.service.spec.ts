import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';

describe('AuthService', () => {
  let service: AuthService;
  let repo: AuthRepository;

  const mockLoginResult = {
    access_token: 'jwt_token',
    login_id: 'login-uuid',
    user: { user_id: 1, first_name: 'John' },
  };

  const mockUser = { user_id: 1, email: 'john@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            validateUser: jest.fn().mockResolvedValue(mockUser),
            login: jest.fn().mockResolvedValue(mockLoginResult),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validateUser', () => {
    it('should delegate to AuthRepository.validateUser', async () => {
      const result = await service.validateUser('john@example.com', 'pass');
      expect(result).toEqual(mockUser);
      expect(repo.validateUser).toHaveBeenCalledWith(
        'john@example.com',
        'pass',
      );
    });
  });

  describe('login', () => {
    it('should delegate to AuthRepository.login', async () => {
      const result = await service.login('john@example.com', 'pass');
      expect(result).toEqual(mockLoginResult);
      expect(repo.login).toHaveBeenCalledWith('john@example.com', 'pass');
    });
  });
});
