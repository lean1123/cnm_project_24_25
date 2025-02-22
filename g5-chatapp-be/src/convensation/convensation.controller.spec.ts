import { Test, TestingModule } from '@nestjs/testing';
import { ConvensationController } from './convensation.controller';

describe('ConvensationController', () => {
  let controller: ConvensationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvensationController],
    }).compile();

    controller = module.get<ConvensationController>(ConvensationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
