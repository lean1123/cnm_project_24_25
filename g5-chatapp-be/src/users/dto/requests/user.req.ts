import { Optional } from '@nestjs/common';
import { Gender } from 'src/auth/enums/gender.enum';
import { Role } from 'src/auth/enums/role.enum';

export class UserRequest {
  @Optional()
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role[];
  status: string;
  refreshToken: string;
  gender: Gender;
}
