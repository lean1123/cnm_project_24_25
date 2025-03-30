import { Test, TestingModule } from '@nestjs/testing';
import { ConvensationService } from './convensation.service';

describe('ConvensationService', () => {
  let service: ConvensationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvensationService],
    }).compile();

    service = module.get<ConvensationService>(ConvensationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
