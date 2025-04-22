import { IsMongoId } from 'class-validator';

export class AdminRemoveMemberRequest {
  @IsMongoId()
  memberId: string;
  @IsMongoId()
  conversationId: string;
}
