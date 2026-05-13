import { Test, TestingModule } from '@nestjs/testing';
import { LabourService } from './labour.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('LabourService', () => {
  let service: LabourService;
  const mockPrisma = {
    labours: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabourService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<LabourService>(LabourService);
  });

  it('retrieves list of labours properly formatted', async () => {
    mockPrisma.labours.findMany.mockResolvedValue([{ id: 1 }]);
    const r = await service.getLabours('1');
    expect(r.status).toBe(200);
  });
});
