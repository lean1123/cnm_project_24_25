import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, ObjectId } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { LoginDto } from './dtos/request/login.dto';
import type { SignUpDto } from './dtos/request/signUp.dto';
import type { AuthResponseDto } from './dtos/response/auth.response.dto';
import { JwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const { firstName, lastName, email, password, role, gender } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = null;

    try {
      user = await this.userModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        status: 'active',
        gender,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }

    const payload = { sub: user._id, username: user.email };

    const token = await this.jwtService.signAsync(payload);

    // update refresh token
    await this.generateAndUpdateRefreshToken(
      user._id as unknown as ObjectId,
      user.email as string,
    );

    return {
      token,
      user: {
        id: user._id as unknown as string,
        email: user.email,
      },
    };
  }

  async signIn(signInDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.jwtService.sign({ id: user._id });

    // update refresh token
    await this.generateAndUpdateRefreshToken(
      user._id as unknown as ObjectId,
      user.email,
    );

    return {
      token,
      user: {
        id: user._id as unknown as string,
        email: user.email,
      },
    };
  }

  async refreshToken(userId: string): Promise<AuthResponseDto> {
    // const user = await this.userModel.findById(new Types.ObjectId({ userId }));
    console.log('userId:', userId);
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const refreshToken = user.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let verified = null;

    try {
      verified = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      console.error('Token không hợp lệ hoặc hết hạn:', error.message);
    }

    if (!verified) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const { exp } = verified;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    if (currentTimeStamp > exp) {
      throw new UnauthorizedException('Refresh Token expired');
    }

    const newAccessToken = this.jwtService.sign({
      sub: user._id,
      username: user.email,
    });

    await this.generateAndUpdateRefreshToken(
      user._id as unknown as ObjectId,
      user.email,
    );

    return {
      token: newAccessToken,
      user: { id: user._id as unknown as string, email: user.email },
    };
  }

  private async generateAndUpdateRefreshToken(
    userId: ObjectId,
    email: string,
  ): Promise<void> {
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, username: email },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    await this.userModel.findOneAndUpdate(userId, { refreshToken });
  }
}
