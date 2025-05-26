import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { JwtPayload } from 'src/conversation/interfaces/jwtPayload.interface';
import { AuthGuard } from '@nestjs/passport';
import { ChatGateway } from '../message/gateway/chat.gateway';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createContact(
    @UserDecorator() userPayload: JwtPayload,
    @Body() contactDto: ContactDto,
  ) {
    return await this.contactService.createContact(userPayload, contactDto);
  }

  @Post('/accept/:contactId')
  @UseGuards(AuthGuard('jwt'))
  async acceptContact(
    @UserDecorator() userPayload: JwtPayload,
    @Param('contactId') contactId: string,
  ) {
    const acceptedContact = await this.contactService.acceptContact(
      userPayload,
      contactId,
    );

    this.chatGateway.handleAcceptRequestContact(
      acceptedContact.updatedContact,
      acceptedContact.newConversationId,
    );

    return acceptedContact.updatedContact;
  }

  @Get('my-contact')
  @UseGuards(AuthGuard('jwt'))
  async getMyContact(@UserDecorator() userPayload: JwtPayload) {
    return await this.contactService.getMyContact(userPayload);
  }

  @Get('get-my-pending-contact')
  @UseGuards(AuthGuard('jwt'))
  async getListAcceptedContact(@UserDecorator() userPayload: JwtPayload) {
    return await this.contactService.getListAcceptedContact(userPayload);
  }

  @Get('get-my-request-contact')
  @UseGuards(AuthGuard('jwt'))
  getListRequestContact(@UserDecorator() userPayload: JwtPayload) {
    return this.contactService.getListRequestContact(userPayload);
  }

  @Post('/reject/:contactId')
  @UseGuards(AuthGuard('jwt'))
  async rejectContact(
    @UserDecorator() userPayload: JwtPayload,
    @Param('contactId') contactId: string,
  ) {
    return await this.contactService.rejectContact(userPayload, contactId);
  }

  @Post('/cancel/:contactId')
  @UseGuards(AuthGuard('jwt'))
  async cancelContact(
    @UserDecorator() userPayload: JwtPayload,
    @Param('contactId') contactId: string,
  ) {
    return await this.contactService.cancelContact(userPayload, contactId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getContactById(@Param('id') id: string) {
    return await this.contactService.getContactById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteContactById(@UserDecorator() userPayload: JwtPayload ,@Param('id') id: string) {
    const deletedContact = await this.contactService.deleteContact(userPayload, id);
    this.chatGateway.handleDeleteContact(
      deletedContact.contact,
      deletedContact.conversation,
    );
    return deletedContact;
  }
}
