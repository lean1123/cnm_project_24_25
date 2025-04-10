import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';
import { ConvensationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConvensationSchema } from './schema/convensation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Convensation', schema: ConvensationSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
  ],
  providers: [
    ConversationService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [ConvensationController],
  exports: [ConversationService, MongooseModule],
})
export class ConversationModule {}
