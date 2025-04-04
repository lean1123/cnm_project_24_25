import { Body, Controller, Param, Post } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async createContact(
    @Body() contactDto: { userId: string; contactId: string },
  ) {
    return await this.contactService.createContact(
      contactDto.userId,
      contactDto.contactId,
    );
  }

  @Post('/accept/:contactId')
  async acceptContact(@Param('contactId') contactId: string) {
    return await this.contactService.acceptContact(contactId);
  }
}
