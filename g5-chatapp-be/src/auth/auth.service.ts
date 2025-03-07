import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import * as bcrypt from 'bcrypt';
import type { SignUpDto } from './dtos/request/signUp.dto';
import type { AuthResponseDto } from './dtos/response/auth.response.dto';
import { LoginDto } from './dtos/request/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const { name, email, password, role, gender } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = null;

    try {
      user = await this.userModel.create({
        email,
        password: hashedPassword,
        name,
        role,
        status: 'active',
        gender,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }

    const token = this.jwtService.sign({ id: user._id });

    // update refresh token
    await this.generateAndUpdateRefreshToken(user._id as unknown as ObjectId);

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
    await this.generateAndUpdateRefreshToken(user._id as unknown as ObjectId);

    return {
      token,
      user: {
        id: user._id as unknown as string,
        email: user.email,
      },
    };
  }

  private async generateAndUpdateRefreshToken(userId: ObjectId): Promise<void> {
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    await this.userModel.findOneAndUpdate(userId, { refreshToken });
  }
}
