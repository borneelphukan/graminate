import { Test, TestingModule } from '@nestjs/testing';
import { AppRepository } from './app.repository';

describe('AppRepository', () => {
  let appRepository: AppRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppRepository],
    }).compile();

    appRepository = module.get<AppRepository>(AppRepository);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appRepository.getHello()).toBe('Hello World!');
    });
  });
});
