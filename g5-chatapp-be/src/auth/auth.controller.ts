import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/request/changePassword.dto';
import { ForgotPassword } from './dtos/request/forgotPassword.dto';
import { ForgotPasswordVerificationDto } from './dtos/request/forgotPasswordVerification.dto';
import { LoginDto } from './dtos/request/login.dto';
import { OtpVerificationDto } from './dtos/request/otpVerification.dto';
import { SignUpDto } from './dtos/request/signUp.dto';
import { AuthResponseDto } from './dtos/response/auth.response.dto';
import { TempUser } from './dtos/response/tempUser.response';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { ChatGateway } from 'src/message/gateway/chat.gateway';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signupDto: SignUpDto): Promise<TempUser> {
    return this.authService.signUp(signupDto);
  }

  @Post('/verify-otp/:userId')
  async verifyOtp(
    @Param('userId') userId: string,
    @Body() body: OtpVerificationDto,
  ): Promise<AuthResponseDto> {
    return this.authService.verifyOtp(userId, body.otp);
  }

  @Post('/provide-otp/:userId')
  async provideOtp(@Param('userId') userId: string): Promise<any> {
    return this.authService.provideOtp(userId);
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  refreshToken(@UserDecorator() user: JwtPayload): Promise<AuthResponseDto> {
    return this.authService.refreshToken(user);
  }

  @Post('forgot-password')
  forgetPassword(@Body() forgotPassword: ForgotPassword) {
    return this.authService.forgotPassword(forgotPassword);
  }

  @Post('forgot-password-verification')
  verifyForgotPassword(
    @Body() forgotPasswordVerificationDto: ForgotPasswordVerificationDto,
  ) {
    return this.authService.verifyForgotPasswordOtp(
      forgotPasswordVerificationDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(
    @UserDecorator() req: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(req, changePasswordDto);
  }

  @Get('get-my-profile')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@UserDecorator() req: JwtPayload) {
    return await this.authService.getMyProfile(req);
  }

  @Get('gennerate-qr-code')
  async generateQrCode() {
    return await this.authService.generateQRData();
  }
  @Post('verify-qr-code')
  @UseGuards(AuthGuard('jwt'))
  async verifyQRCode(
    @Body() verifitionBody: { sessionId: string },
    @UserDecorator() req: JwtPayload,
  ) {
    const loginQRResult = await this.authService.verifyQRLogin(
      verifitionBody.sessionId,
      req._id,
    );

    this.chatGateway.handleLoginByQrCodeResult({
      sessionId: verifitionBody.sessionId,
      user: loginQRResult.user,
      token: loginQRResult.tokenForUser,
    });
  }
}
