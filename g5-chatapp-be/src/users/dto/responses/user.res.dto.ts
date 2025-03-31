import { Role } from 'src/auth/enums/role.enum';
import { User } from '../../schema/user.schema';
import { Gender } from 'src/auth/enums/gender.enum';

export class UserResponseDto {
  _id: string;
  full_name: String;
  dob?: Date;
  email: string;
  role: Role[];
  status: string;
  gender: Gender;
  profile_picture?: string;
  phone: string;
  bio?: string;
  account_type: string;
  isActive: boolean;
  friends: User[];
}
