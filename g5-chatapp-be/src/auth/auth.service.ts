import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { Model, ObjectId, Date } from 'mongoose';
import { OtpService } from 'src/mail/otpGenerator/otp.service';
import { User } from 'src/users/schema/user.schema';
import { ChangePasswordDto } from './dtos/request/changePassword.dto';
import { ForgotPassword } from './dtos/request/forgotPassword.dto';
import { ForgotPasswordVerificationDto } from './dtos/request/forgotPasswordVerification.dto';
import { LoginDto } from './dtos/request/login.dto';
import type { SignUpDto } from './dtos/request/signUp.dto';
import type { AuthResponseDto } from './dtos/response/auth.response.dto';
import { TempUser } from './dtos/response/tempUser.response';
import { JwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly otpService: OtpService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<TempUser> {
    const { firstName, lastName, email, password, role, gender, dob } =
      signUpDto;

    // Check if email already exists
    const existedUser = await this.userModel.findOne({ email });
    if (existedUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = Math.floor(Math.random() * 1000000).toString();
    this.logger.log(`Generated userId: ${userId}`);

    const user = {
      userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      status: 'inactive',
      gender,
      dob,
    };

    try {
      await this.redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300);
      const fullName = `${firstName} ${lastName}`;

      await this.otpService.sendOTP(email, fullName);
    } catch (error) {
      throw new UnauthorizedException(error);
    }

    return user;
  }

  async verifyOtp(userId: string, otp: string): Promise<AuthResponseDto> {
    const user = await this.redis.get(`user:${userId}`);

    if (!user) {
      throw new UnauthorizedException('User not found in the create user');
    }

    const parsedUser = JSON.parse(user) as TempUser;

    const isValidOtp = await this.otpService.verifyOTP(parsedUser.email, otp);

    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    parsedUser.status = 'active';
    let savedUser: User;
    try {
      delete parsedUser.userId;
      savedUser = await this.userModel.create(parsedUser);
      await this.redis.del(`user:${userId}`);

      await this.generateAndUpdateRefreshToken(
        savedUser._id as ObjectId,
        savedUser.email,
      );
    } catch (error) {
      throw new UnauthorizedException(
        'Error while creating new user: ' + error,
      );
    }

    const token = this.jwtService.sign({ sub: savedUser._id });
    return {
      token,
      user: {
        id: savedUser._id as string,
        email: savedUser.email,
      },
    };
  }

  async provideOtp(
    userId: string,
  ): Promise<{ message: string; userId: string }> {
    const user = await this.redis.get(`user:${userId}`);
    if (!user) {
      throw new UnauthorizedException('User not found in the temp users');
    }

    const parsedUser = JSON.parse(user) as TempUser;

    const fullName = `${parsedUser.firstName} ${parsedUser.lastName}`;

    await this.otpService.sendOTP(parsedUser.email, fullName);
    this.logger.log(`OTP resent to ${parsedUser.email}`);

    return {
      message: 'OTP resent successfully',
      userId: parsedUser.userId,
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

    const token = this.jwtService.sign({ sub: user._id });

    // update refresh token
    await this.generateAndUpdateRefreshToken(user._id as ObjectId, user.email);

    return {
      token,
      user: {
        id: user._id as string,
        email: user.email,
      },
    };
  }

  async refreshToken(user: JwtPayload): Promise<AuthResponseDto> {
    const matchedUser = await this.userModel.findById(user._id);

    if (!matchedUser) {
      throw new UnauthorizedException('User not found in refresh token');
    }

    const refreshToken = matchedUser.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let verified: JwtPayload;

    try {
      verified = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      const err = error as Error;
      console.error('Token không hợp lệ hoặc hết hạn:', err.message);
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
      matchedUser._id as ObjectId,
      user.email,
    );

    return {
      token: newAccessToken,
      user: { id: matchedUser._id as string, email: user.email },
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

  async forgotPassword(forgotPassword: ForgotPassword) {
    const existedUser = await this.userModel.findOne({
      email: forgotPassword.email,
    });

    if (!existedUser) {
      throw new Error('Email not found');
    }

    await this.redis.set(
      `new-password-temp:${existedUser.email}`,
      JSON.stringify(forgotPassword),
      'EX',
      300,
    );

    const fullName = `${existedUser.firstName} ${existedUser.lastName}`;

    // Luu Trong Redis OTP
    await this.otpService.sendOTP(forgotPassword.email, fullName, true);
    return {
      message: 'OTP sent to your email',
      id: existedUser._id,
    };
  }

  async verifyForgotPasswordOtp(
    verificationForgotPassword: ForgotPasswordVerificationDto,
  ): Promise<{ message: string; id: string }> {
    const otp = await this.redis.get(
      `forgot-password-otp:${verificationForgotPassword.email}`,
    );

    if (!otp) {
      throw new UnauthorizedException('OTP expired or not found');
    }
    const newPasswordTemp = await this.redis.get(
      `new-password-temp:${verificationForgotPassword.email}`,
    );
    if (!newPasswordTemp) {
      throw new UnauthorizedException('New password temp not found');
    }

    if (otp !== verificationForgotPassword.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const parsedUser = JSON.parse(newPasswordTemp) as ForgotPassword;

    const existedUser = await this.userModel.findOne({
      email: parsedUser.email,
    });

    if (!existedUser) {
      throw new UnauthorizedException('Email not found');
    }

    const hashedPassword = await bcrypt.hash(parsedUser.newPassword, 10);

    await this.userModel.findByIdAndUpdate(existedUser._id, {
      password: hashedPassword,
    });

    await this.redis.del(`new-password-temp:${existedUser.email}`);
    await this.redis.del(`forgot-password-otp:${existedUser.email}`);

    return {
      message: 'Password updated successfully',
      id: existedUser._id as string,
    };
  }

  async changePassword(req: JwtPayload, changePassword: ChangePasswordDto) {
    const userId = req._id;
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      changePassword.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const hashedPassword = await bcrypt.hash(changePassword.newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    return {
      message: 'Password updated successfully',
      id: user._id as string,
    };
  }

  async getMyProfile(req: JwtPayload) {
    const userId = req._id;

    if (!userId) {
      throw new UnauthorizedException('User not found in Jwt Payload');
    }

    const user = await this.userModel
      .findById(userId)
      .select(['-password', '-refreshToken']);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
