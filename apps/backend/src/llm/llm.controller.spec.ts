import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

describe('LlmController', () => {
  let controller: LlmController;
  const mockService = { generateResponse: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [{ provide: LlmService, useValue: mockService }],
    }).compile();
    controller = module.get<LlmController>(LlmController);
  });

  it('triggers high level service hook method handler', async () => {
    mockService.generateResponse.mockResolvedValue({ answer: 'Hi' });
    const res = await controller.create({} as any);
    expect(res.answer).toBe('Hi');
  });
});
