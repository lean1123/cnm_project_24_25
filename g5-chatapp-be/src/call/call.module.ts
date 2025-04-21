import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Call, CallSchema } from './schema/call.schema';
import { AuthModule } from 'src/auth/auth.module';
// import { APP_GUARD } from '@nestjs/core';
// import { ThrottlerGuard } from '@nestjs/throttler';
import {
  CallParticipant,
  CallParticipantSchema,
} from './schema/callParticipants.schema';
import { CallQuality, CallQualitySchema } from './schema/callQuality.schema';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }]),
    MongooseModule.forFeature([
      { name: CallParticipant.name, schema: CallParticipantSchema },
    ]),
    MongooseModule.forFeature([
      { name: CallQuality.name, schema: CallQualitySchema },
    ]),
    AuthModule,
    ConversationModule,
    UserModule,
    MessageModule
  ],
  providers: [
    CallService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
  controllers: [CallController],
  exports: [CallService, MongooseModule],
})
export class CallModule {}
