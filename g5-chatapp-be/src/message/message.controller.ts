import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatGateway } from 'src/message/gateway/chat.gateway';
import { MessageRequest } from './dtos/requests/message.request';
import { MessageService } from './message.service';
import { Message } from './schema/messege.chema';
import { AuthGuard } from '@nestjs/passport';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { MessageForwardationRequest } from './dtos/requests/messageForwardation.request';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('/send-message/:convensationId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessage(
    @Param('convensationId') conversationId: string,
    @UserDecorator() user: JwtPayload,
    @Body() message: MessageRequest,
    @UploadedFiles() file: Express.Multer.File[],
  ): Promise<void> {
    await this.chatGateway.handleMessage({
      conversationId,
      user,
      messageDto: message,
      files: file,
    });
  }

  @Post('/forward-message')
  @UseGuards(AuthGuard('jwt'))
  async forwardMessage(
    @UserDecorator() user: JwtPayload,

    @Body() messageForwardation: MessageForwardationRequest,
  ) {
    const messageForwarded = await this.messageService.forwardMessage(
      user,
      messageForwardation,
    );
    this.chatGateway.handleForwardMessage(messageForwarded);

    return messageForwarded;
  }

  @Get(':conversationId')
  async getMessagesByConvensation(
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{
    data: Message[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    return await this.messageService.getMessagesByConvensation(
      conversationId,
      page,
      limit,
    );
  }

  @Get('newest/:conversationId')
  async getNewestMessagesByConvensation(
    @Param('conversationId') conversationId: string,
  ): Promise<Message[]> {
    return await this.messageService.getNewestMessageByConversation(
      conversationId,
    );
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
