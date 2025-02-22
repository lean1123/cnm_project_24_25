import { Module } from '@nestjs/common';
import { ConvensationService } from './convensation.service';
import { ConvensationController } from './convensation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConvensationSchema } from './schema/convensation.schema';
import { AuthModule } from 'src/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Convensation', schema: ConvensationSchema },
    ]),
    AuthModule,
  ],
  providers: [
    ConvensationService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [ConvensationController],
  exports: [ConvensationService, MongooseModule],
})
export class ConvensationModule {}
