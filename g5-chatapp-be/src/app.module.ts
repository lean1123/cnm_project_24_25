import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CallModule } from './call/call.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { ConversationModule } from './conversation/conversation.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './mail/otpGenerator/otp.module';
import { MessageModule } from './message/message.module';
import { RedisModule } from './redis/redis.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 10000,
    //     limit: 60,
    //   },
    // ]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    AuthModule,
    ConversationModule,
    MessageModule,
    ContactModule,
    CallModule,
    UploadModule,
    CloudinaryModule,
    MailModule,
    RedisModule,
    OtpModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
