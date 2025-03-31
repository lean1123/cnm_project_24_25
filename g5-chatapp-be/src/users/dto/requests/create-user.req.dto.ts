import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/auth/enums/gender.enum';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'full name is required' })
  full_name: string;

  @ApiProperty({
    example: 'jonh.example@gmail.com',
    description: 'Email of the user',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password of the user, must be at least 6 characters',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ example: 'male | female | other' })
  @IsEnum(Gender, { message: 'Gender Invalid' })
  gender: Gender;

  @ApiProperty({ example: '1990-01-01' })
  dob?: Date;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString({ message: 'image url invalid' })
  @IsOptional()
  profile_picture?: string;

  @ApiProperty({
    example: '08123456789',
    description: 'Phone number of the user',
  })
  @IsString({ message: 'phone invalid' })
  phone: string;

  @ApiProperty({
    example: 'thentrees so handsome ^^',
    description: 'a short paragraph describing yourself or anything',
  })
  @IsOptional()
  bio?: string;
}
