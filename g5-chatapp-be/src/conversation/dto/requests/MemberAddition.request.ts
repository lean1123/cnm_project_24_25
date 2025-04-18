import { IsMongoId } from 'class-validator';

export class MemberAdditionRequest {
  @IsMongoId({ each: true })
  newMemberIds: string[];
}
