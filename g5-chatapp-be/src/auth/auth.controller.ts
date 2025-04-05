import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/request/login.dto';
import { SignUpDto } from './dtos/request/signUp.dto';
import { AuthResponseDto } from './dtos/response/auth.response.dto';

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

  @Post('refresh-token/:id')
  refreshToken(@Param('id') id: string): Promise<AuthResponseDto> {
    return this.authService.refreshToken(id);
  }
}
