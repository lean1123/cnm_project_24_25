import { IsEmail, IsString, Length } from 'class-validator';

export class ForgotPassword {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  newPassword: string;
}
