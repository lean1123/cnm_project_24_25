import { IsMongoId } from 'class-validator';

export class AdminChangeConversationDto {
  @IsMongoId()
  adminId: string;
}
