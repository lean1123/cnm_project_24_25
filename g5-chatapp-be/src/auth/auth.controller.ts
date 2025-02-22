import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dtos/response/auth.response.dto';
import { SignUpDto } from './dtos/request/signUp.dto';
import { LoginDto } from './dtos/request/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signupDto: SignUpDto): Promise<AuthResponseDto> {
    return this.authService.signUp(signupDto);
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }
}
