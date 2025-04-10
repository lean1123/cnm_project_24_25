import { IsNotEmpty } from 'class-validator';

export class ContactDto {
  @IsNotEmpty({ message: 'ContactId is required' })
  contactId: string;
}
