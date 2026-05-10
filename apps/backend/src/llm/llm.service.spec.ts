import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { LlmRepository } from './llm.repository';

describe('LlmService', () => {
  let service: LlmService;
  const mockRepo = { generateResponse: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmService, { provide: LlmRepository, useValue: mockRepo }],
    }).compile();
    service = module.get<LlmService>(LlmService);
  });

  it('proxies generating response to the backend repository hook', async () => {
    mockRepo.generateResponse.mockResolvedValue({ answer: 'Yes' });
    const res = await service.generateResponse({} as any);
    expect(res.answer).toBe('Yes');
  });
});
