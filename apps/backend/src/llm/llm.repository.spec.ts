jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              { message: { content: 'Mock Response', tool_calls: null } },
            ],
          }),
        },
      },
    })),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { LlmRepository } from './llm.repository';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { PrismaService } from '@/prisma/prisma.service';

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
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn().mockResolvedValue({
                plan: 'FREE',
                llm_queries_this_month: 0,
                llm_queries_reset_at: new Date(),
              }),
            },
            llm_queries: {
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();
    repository = module.get<LlmRepository>(LlmRepository);
  });

  it('hits mocked OpenAI client to build conversation completion', async () => {
    const res = await repository.generateResponse({
      history: [{ sender: 'user', text: 'Hello' }],
      userId: '1',
      token: 'tok',
    });
    expect(res.answer).toBe('Mock Response');
  });
});
