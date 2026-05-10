import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

describe('LoansController', () => {
  let controller: LoansController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [{ provide: LoansService, useValue: mockService }],
    }).compile();
    controller = module.get<LoansController>(LoansController);
  });

  it('gets full loan list without wrapper modifications', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll(1);
    expect(result).toEqual([]);
  });
});
