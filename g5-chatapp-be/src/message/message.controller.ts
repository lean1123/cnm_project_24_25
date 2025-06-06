import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { MessageReactionRequest } from './dtos/requests/messageReaction.request';

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

  @Put('/reaction')
  @UseGuards(AuthGuard('jwt'))
  async reactionMessage(
    @Body() body: MessageReactionRequest,
    @UserDecorator() userPayload: JwtPayload,
  ): Promise<Message> {
    const messageReaction = await this.messageService.reactToMessage(
      userPayload,
      body,
    );

    this.chatGateway.handleReactToMessage(messageReaction);

    return messageReaction;
  }

  @Put('/:messageId/un-reaction')
  @UseGuards(AuthGuard('jwt'))
  async unReactionMessage(
    @Param('messageId') messageId: string,
    @UserDecorator() userPayload: JwtPayload,
  ): Promise<Message> {
    const messageUnReaction = await this.messageService.unReactToMessage(
      userPayload,
      messageId,
    );

    this.chatGateway.handleUnReactToMessage(messageUnReaction);

    return messageUnReaction;
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

  /**
   * del message for self (user logged in) -> soft delete -> update deleteFor and isRevoked message
   * @param messageId
   * @param req -> userId
   * @returns message
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':messageId/revoke-self')
  async revokeMessage(
    @Param('messageId') messageId: string,
    @UserDecorator() req: JwtPayload,
  ) {
    const userId = req._id;

    const seltHidationMessage = await this.messageService.revokeMessage(
      messageId,
      userId,
    );

    this.chatGateway.handleDeleteMessage(seltHidationMessage);

    return seltHidationMessage;
  }

  /**
   * revoke message for both or all user into gr  (only sender has permission del) -> soft delete -> update deleteFor and isRevoked message
   * @param messageId -> messageId
   * @param conversationId -> conversationId -> check senderId and receiverId in conversationId
   * @returns message
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':messageId/revoke-both')
  async revokeMessageBoth(
    @Param('messageId') messageId: string,
    // @Param('conversationId') conversationId: string,
    @UserDecorator() req: JwtPayload,
  ) {
    const userId = req._id;
    const revorkedMessage = await this.messageService.revokeMessageBoth(
      messageId,
      // conversationId,
      userId,
    );

    this.chatGateway.handleRevokeMessage(revorkedMessage);
    return revorkedMessage;
  }

  /**
   * forward message to other conversationId (only sender has permission forward)
   * @param messageId
   * @param conversationIds
   * @param req
   * @returns message
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('/forward')
  async forwardMessage(
    @Body()
    body: MessageForwardationRequest,
    @UserDecorator() userPayload: JwtPayload,
  ): Promise<Message[]> {
    const messageForwardations =
      await this.messageService.forwardMessageToMultipleConversations(
        body,
        userPayload,
      );

    this.chatGateway.handleForwardMessage(messageForwardations);

    return messageForwardations;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:conversationId/files')
  async getFilesByConversationId(
    @Param('conversationId') conversationId: string,
  ) {
    return await this.messageService.getFilesByConversationId(conversationId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:conversationId/media')
  async getMediaByConversationId(
    @Param('conversationId') conversationId: string,
  ) {
    return await this.messageService.getImagesAndVideosByConversationId(
      conversationId,
    );
  }
}
