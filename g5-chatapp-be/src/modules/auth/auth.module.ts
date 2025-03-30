import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSchema } from '../users/schema/user.schema';
import { UserModule } from '../users/user.module';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(), // Import ConfigModule để sử dụng ConfigService
    UserModule, // Import UserModule để sử dụng UserService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'), // Lấy secret từ biến môi trường
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES'), // Thời gian hết hạn của JWT
        },
      }),
      inject: [ConfigService], // Inject ConfigService vào useFactory
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), // Đăng ký User schema
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy], // Cung cấp các service và strategy
  controllers: [AuthController], // Khai báo controller
  exports: [AuthService], // Xuất AuthService
})
export class AuthModule {}
