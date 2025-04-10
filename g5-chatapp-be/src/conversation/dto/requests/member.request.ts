import { IsOptional } from 'class-validator';

export class MemberRequest {
  userId: string;
  @IsOptional()
  fullName: string;
}
