import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  providers: [
    UploadService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    UploadController,
  ],
  controllers: [UploadController],
  exports: [UploadService, UploadController],
})
export class UploadModule {}
