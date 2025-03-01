import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MessageRequest } from './dtos/requests/message.request';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':conversationId')
  async sendMessage(
    @Param('conversationId') convensationId: string,
    @Body() message: MessageRequest,
  ) {
    return await this.messageService.createMessage(convensationId, message);
  }

  @Get(':conversationId')
  async getMessagesByConvensation(conversationId: string) {
    return await this.messageService.getMessagesByConvensation(conversationId);
  }

  @Put(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() message: MessageRequest,
  ) {
    return await this.messageService.updateMessage(messageId, message);
  }

  @Get(':messageId')
  async getMessageById(@Param('messageId') messageId: string) {
    return await this.messageService.getMessageById(messageId);
  }
}
