import { Optional } from '@nestjs/common';

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
  members: string[];
  @Optional()
  lastMessage: string;
}
