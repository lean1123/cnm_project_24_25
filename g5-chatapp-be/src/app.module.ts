import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { ConvensationModule } from './convensation/convensation.module';
import { MessageModule } from './message/message.module';
import { ContactModule } from './contact/contact.module';
import { CallModule } from './call/call.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { MailModule } from './mail/mail.module';
import { TransformInterceptor } from './core/transform.interceptor';
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
})
export class AppModule {}
