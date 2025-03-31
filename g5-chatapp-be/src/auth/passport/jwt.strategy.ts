import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.access_token, // Lấy AT từ Cookie
      ]),
      ignoreExpiration: false, // Bật kiểm tra hết hạn cho token
      secretOrKey: configService.get<string>('JWT_SECRET'), // Lấy secret từ file .env
    });
  }

  async validate(payload: any) {
    console.log('payload', payload);
    return { userId: payload.sub, username: payload.username };
  }
}
