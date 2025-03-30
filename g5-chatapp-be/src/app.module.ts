import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConvensationModule } from './modules/convensation/convensation.module';
import { MessageModule } from './modules/message/message.module';
import { ContactModule } from './modules/contact/contact.module';
import { CallModule } from './modules/call/call.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { MailModule } from './modules/mail/mail.module';
=======
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
>>>>>>> f923f0924b0d2a5e09debdfd3517d52621174a8d

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ConvensationModule,
    MessageModule,
    ContactModule,
    CallModule,
    UploadModule,
<<<<<<< HEAD
    CacheModule.register({ isGlobal: true }),
    MailModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
=======
    CloudinaryModule,
  ],
  controllers: [],
  providers: [],
>>>>>>> f923f0924b0d2a5e09debdfd3517d52621174a8d
})
export class AppModule {}
