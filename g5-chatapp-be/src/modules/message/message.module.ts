import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schema/messege.chema';

import { UploadModule } from 'src/upload/upload.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { ConvensationModule } from '../convensation/convensation.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    AuthModule,
    UserModule,
    ConvensationModule,
    UploadModule,
  ],
  providers: [
    MessageService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [MessageController],
  exports: [MessageService, MongooseModule],
})
export class MessageModule {}
