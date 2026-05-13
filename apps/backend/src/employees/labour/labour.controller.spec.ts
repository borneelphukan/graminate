import { Test, TestingModule } from '@nestjs/testing';
import { LabourController } from './labour.controller';
import { LabourService } from './labour.service';

describe('LabourController', () => {
  let controller: LabourController;
  const mockService = {
    getLabours: jest.fn(),
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabourController],
      providers: [{ provide: LabourService, useValue: mockService }],
    }).compile();
    controller = module.get<LabourController>(LabourController);
  });

  it('forwards service result map onto standard res response handler', async () => {
    mockService.getLabours.mockResolvedValue({
      status: 200,
      data: { labours: [] },
    });
    await controller.getLabours('1', mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
