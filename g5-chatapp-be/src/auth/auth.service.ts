import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareHashHelper } from 'src/helpers';
import { Response } from 'express';
import { User, UserDocument } from '../users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/users/user.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValidPassword = await compareHashHelper(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  /**
   *  Generate access token and refresh token => save refresh token to cookie
   * @param user
   * @param res
   * @returns token key pair
   */
  async login(user: any, res: Response) {
    const { accessToken, refreshToken } = await this.generateTokensPair(
      user._id,
      user.email,
    );

    await this.userModel.updateOne(
      { _id: user._id },
      { refresh_token: refreshToken },
    );

    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);

    // Lưu Access Token vào Cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ bật secure khi chạy production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    return { refreshToken };
  }

  async refreshToken(oldRefreshToken: string, res: Response) {
    const user = await this.userModel.findOne({
      refresh_token: oldRefreshToken,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const payload = this.jwtService.verify(oldRefreshToken, {
      secret: process.env.JWT_REFRESH_SECRET, // Kiểm tra lại secret này
    });
    const { accessToken, refreshToken } = await this.generateTokensPair(
      payload.sub,
      payload.email,
    );
    // Lưu Refresh Token mới vào MongoDB
    await this.userModel.updateOne(
      { refresh_token: oldRefreshToken },
      { refresh_token: refreshToken },
    );
    // Lưu Access Token mới vào Cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    return { refreshToken };
  }

  async logout(userId: string, res: Response) {
    await this.userModel.deleteMany({ userId });

    res.clearCookie('access_token');

    return { message: 'Logged out successfully' };
  }

  // Tạo Access Token và Refresh Token
  async generateTokensPair(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, username: email },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES'),
      }, // Access Token sống 1h
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, username: email },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES'),
      }, // Refresh Token sống 7 ngày
    );

    return { accessToken, refreshToken };
  }

  async verifyAccount(email: string, code: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã xác thực');
    }
    if (user.code !== code || new Date() > user.code_expired) {
      throw new BadRequestException('Mã xác nhận không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật trạng thái xác thực
    user.isActive = true;
    user.code = null;
    user.code_expired = null;
    await user.save();

    return { message: 'Tài khoản đã được xác thực thành công' };
  }
}
