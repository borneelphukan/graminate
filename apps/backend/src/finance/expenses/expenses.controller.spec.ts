import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  const mockService = {
    findByUserId: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: mockService }],
    }).compile();
    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('delegates param processing down to service correctly', async () => {
    mockService.findByUserId.mockResolvedValue([]);
    const res = await controller.getByUserId(1);
    expect(res).toEqual({ expenses: [] });
  });
});
