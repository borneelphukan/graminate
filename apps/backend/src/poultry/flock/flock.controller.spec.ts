import { Test, TestingModule } from '@nestjs/testing';
import { FlockController } from './flock.controller';
import { FlockService } from './flock.service';
import { poultryFlockSchema } from '@graminate/shared';

jest.mock('@graminate/shared', () => ({
  poultryFlockSchema: {
    parse: jest.fn((x) => x),
  },
}));

describe('FlockController', () => {
  let controller: FlockController;
  let service: FlockService;

  const mockService = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlockController],
      providers: [{ provide: FlockService, useValue: mockService }],
    }).compile();

    controller = module.get<FlockController>(FlockController);
    service = module.get<FlockService>(FlockService);
  });

  it('addFlock validates using poultry schema dependency and forwards', async () => {
    const payload = { flock_name: 'A' };
    mockService.create.mockResolvedValue({ id: 1 });

    await controller.addFlock(payload as any);
    expect(poultryFlockSchema.parse).toHaveBeenCalledWith(payload);
    expect(service.create).toHaveBeenCalledWith(payload);
  });
});
