import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { JwtPayload } from 'src/conversation/interfaces/jwtPayload.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createContact(
    @UserDecorator() userPayload: JwtPayload,
    @Body() contactDto: ContactDto,
  ) {
    return await this.contactService.createContact(userPayload, contactDto);
  }

  @Post('/accept/:contactId')
  async acceptContact(@Param('contactId') contactId: string) {
    return await this.contactService.acceptContact(contactId);
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
}
