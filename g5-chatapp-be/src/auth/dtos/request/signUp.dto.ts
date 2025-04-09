import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsBeforeToday } from 'src/common/validates/is-before-date.validator';

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
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString({}, { message: 'Invalid date format' })
  @IsBeforeToday({ message: 'Date of birth must be before today' })
  dob: string;
}
