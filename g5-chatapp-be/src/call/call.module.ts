import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallController } from './call.controller';

@Module({
  providers: [CallService],
  controllers: [CallController]
})
export class CallModule {}
