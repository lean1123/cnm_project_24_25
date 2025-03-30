import { Gender } from 'src/common/enums/gender.enum';
import { User } from '../../schema/user.schema';
import { Role } from 'src/common/enums/role.enum';

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
