import { Public } from './../../decorators/customize';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { ResponseMessage } from 'src/decorators/customize';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Response as ExpressResponse } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Fetch login')
  handleLogin(
    @Request() req,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    return this.authService.login(req.user, res);
  }

  @UseGuards(AuthGuard())
  @Post('refresh-token')
  async refreshToken(
    @Headers('authorization') authHeader: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Refresh token is missing or invalid');
    }

    const refreshToken = authHeader.split(' ')[1];
    return await this.authService.refreshToken(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Request() req,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    return this.authService.logout(req.user['userId'], res);
  }

  @Public()
  @Post('verify')
  async verifyAccount(@Body() body: { email: string; code: string }) {
    return this.authService.verifyAccount(body.email, body.code);
  }
}
