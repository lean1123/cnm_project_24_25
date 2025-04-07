import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CallModule } from './call/call.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { ConvensationModule } from './convensation/convensation.module';
import { MessageModule } from './message/message.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { OtpModule } from './mail/otpGenerator/otp.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 60,
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    AuthModule,
    ConvensationModule,
    MessageModule,
    ContactModule,
    CallModule,
    UploadModule,
    CloudinaryModule,
    MailModule,
    RedisModule,
    OtpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
