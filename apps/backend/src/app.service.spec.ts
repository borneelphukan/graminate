import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppRepository } from './app.repository';

describe('AppService', () => {
  let appService: AppService;
  let appRepository: AppRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: AppRepository,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    appRepository = module.get<AppRepository>(AppRepository);
  });

  describe('getHello', () => {
    it('should return "Hello World!" from repository', () => {
      expect(appService.getHello()).toBe('Hello World!');
      expect(appRepository.getHello).toHaveBeenCalled();
    });
  });
});
