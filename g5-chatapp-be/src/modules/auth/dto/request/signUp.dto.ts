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
<<<<<<< HEAD:g5-chatapp-be/src/modules/auth/dto/request/signUp.dto.ts
  name: string;
=======
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
>>>>>>> f923f0924b0d2a5e09debdfd3517d52621174a8d:g5-chatapp-be/src/auth/dtos/request/signUp.dto.ts
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
