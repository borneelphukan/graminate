import { Test, TestingModule } from '@nestjs/testing';
import { CattleRearingController } from './cattle-rearing.controller';
import { CattleRearingService } from './cattle-rearing.service';
import { cattleRearingSchema } from '@graminate/shared';

jest.mock('@graminate/shared', () => ({
  cattleRearingSchema: {
    parse: jest.fn((i) => i),
  },
}));

describe('CattleRearingController', () => {
  let controller: CattleRearingController;
  let service: CattleRearingService;

  const mockService = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetForUser: jest.fn(),
    resetTable: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CattleRearingController],
      providers: [{ provide: CattleRearingService, useValue: mockService }],
    }).compile();

    controller = module.get<CattleRearingController>(CattleRearingController);
    service = module.get<CattleRearingService>(CattleRearingService);
  });

  it('delegates add operation with validated schema payload', async () => {
    const mockObj = { breed: 'X' };
    mockService.create.mockResolvedValue({ id: 1 });
    await controller.addCattleRearing(mockObj as any);

    expect(cattleRearingSchema.parse).toHaveBeenCalledWith(mockObj);
    expect(service.create).toHaveBeenCalledWith(mockObj);
  });

  it('wraps getByUserId result correctly', async () => {
    mockService.findByUserId.mockResolvedValue([{ id: 1 }]);
    const res = await controller.getByUserId(1);
    expect(res).toHaveProperty('cattleRearings');
  });
});
