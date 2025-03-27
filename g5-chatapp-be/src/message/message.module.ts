import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from 'src/auth/auth.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schema/messege.chema';
import { UsersModule } from 'src/users/users.module';
import { ConvensationModule } from 'src/convensation/convensation.module';
import { UploadModule } from 'src/upload/upload.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    AuthModule,
    UsersModule,
    ConvensationModule,
    UploadModule,
    CloudinaryModule,
  ],
  providers: [
    MessageService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ChatGateway,
  ],
  controllers: [MessageController],
  exports: [MessageService, MongooseModule],
})
export class MessageModule {}
