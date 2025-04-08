import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordVerificationDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}
