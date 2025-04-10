import { IsDateString, IsNotEmpty, Length } from 'class-validator';
import { Gender } from 'src/auth/enums/gender.enum';
import { IsBeforeToday } from 'src/common/validates/is-before-date.validator';

export class UserRequest {
  @IsNotEmpty({ message: 'First name is required' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName: string;
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName: string;
  @IsNotEmpty({ message: 'Gender is required' })
  gender: Gender;
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  @IsBeforeToday({ message: 'Date of birth must be before today' })
  dob: string;
}
