import { IsMongoId } from 'class-validator';

export class MemberRemovationRequest {
  @IsMongoId()
  memberId: string;
}
