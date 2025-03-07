import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessageRequest } from './dtos/requests/message.request';
import { MessageService } from './message.service';
import { Message } from './schema/messege.chema';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':convensationId')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessage(
    @Param('convensationId') convensationId: string,
    @Body() message: MessageRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.messageService.createMessage(
      convensationId,
      message,
      files,
    );
  }

  @Get(':conversationId')
  async getMessagesByConvensation(
    @Param('conversationId') conversationId: string,
  ): Promise<Message[]> {
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
