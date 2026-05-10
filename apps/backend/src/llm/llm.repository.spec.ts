jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mock Response', tool_calls: null } }]
          })
        }
      }
    }))
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { LlmRepository } from './llm.repository';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('LlmRepository', () => {
  let repository: LlmRepository;
  const mockConfigService = { get: jest.fn().mockReturnValue('fake-key') };
  const mockHttpService = { get: jest.fn().mockReturnValue(of({ data: {} })) };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmRepository,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();
    repository = module.get<LlmRepository>(LlmRepository);
  });

  it('hits mocked OpenAI client to build conversation completion', async () => {
    const res = await repository.generateResponse({
      history: [{ sender: 'user', text: 'Hello' }],
      userId: '1',
      token: 'tok'
    });
    expect(res.answer).toBe('Mock Response');
  });
});
