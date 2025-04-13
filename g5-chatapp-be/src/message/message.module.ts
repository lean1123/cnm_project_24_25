import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from 'src/auth/auth.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schema/messege.chema';
import { UserModule } from 'src/user/user.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UploadModule } from 'src/upload/upload.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ChatGateway } from 'src/message/gateway/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ConversationModule),
    CloudinaryModule,
    UploadModule,
  ],
  providers: [
    MessageService,
    // {
    //   provide: APP_GUARD,
    //   // useClass: ThrottlerGuard,
    // },
    ChatGateway,
  ],
  controllers: [MessageController],
  exports: [MessageService, MongooseModule, ChatGateway],
})
export class MessageModule {}
