import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
