import { Optional } from '@nestjs/common';
import { MemberRequest } from './member.request';

export class ConvensationRequest {
  @Optional()
  _id: string;
  @Optional()
  name: string;
  @Optional()
  profilePicture: string;
  @Optional()
  isGroup: boolean;
  @Optional()
  admin: string;
  members: MemberRequest[];
  @Optional()
  lastMessage: string;
}
