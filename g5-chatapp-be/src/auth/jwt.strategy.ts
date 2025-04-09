import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/schema/user.schema';

interface JwtPayload {
  sub: string;
  username: string;
  exp: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    // sub = userId
    const { sub, exp } = payload;

    const user = await this.userModel.findById(sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const currentTimeStamp = Math.floor(Date.now() / 1000);

    if (currentTimeStamp > parseInt(exp)) {
      throw new UnauthorizedException('Token expired');
    }

    return user;
  }
}
