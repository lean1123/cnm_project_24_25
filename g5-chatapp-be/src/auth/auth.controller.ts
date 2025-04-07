import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/request/login.dto';
import { SignUpDto } from './dtos/request/signUp.dto';
import { AuthResponseDto } from './dtos/response/auth.response.dto';
import { TempUser } from './dtos/response/tempUser.response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signupDto: SignUpDto): Promise<TempUser> {
    return this.authService.signUp(signupDto);
  }

  @Post('/verify-otp/:userId')
  async verifyOtp(
    @Param('userId') userId: string,
    @Body() body: { otp: string },
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

  @Post('refresh-token/:id')
  refreshToken(@Param('id') id: string): Promise<AuthResponseDto> {
    return this.authService.refreshToken(id);
  }
}
