import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { ConvensationController } from './convensation.controller';
import { ConvensationService } from './convensation.service';
import { ConvensationSchema } from './schema/convensation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Convensation', schema: ConvensationSchema },
    ]),
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
