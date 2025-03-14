import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @IsOptional()
  role: string[];
  @IsNotEmpty()
  gender: string;
}
