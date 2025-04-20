import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { MessageService } from '../message.service';
import { MessageRequest } from '../dtos/requests/message.request';
import { Server } from 'socket.io';
import { Message } from '../schema/messege.chema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HandleMessage {
  constructor(private readonly messageService: MessageService) {}

  async handleMessage(
    {
      conversationId,
      user,
      messageDto,
      files,
    }: {
      conversationId: string;
      user: JwtPayload;
      messageDto: MessageRequest;
      files: Express.Multer.File[];
    },
    server: Server,
  ) {
    const message = await this.messageService.createMessage(
      conversationId,
      user,
      messageDto,
      files,
    );

    server.to(conversationId).emit('newMessage', message);
  }

  handleForwardMessage(messageForwarded: Message[], server: Server) {
    for (const message of messageForwarded) {
      const conversationId = message.conversation?.toString();
      if (conversationId) {
        server.to(conversationId).emit('newMessage', message);
      }
    }
  }

  handleDeleteMessage(message: Message, server: Server) {
    const conversationId = message.conversation?.toString();
    if (conversationId) {
      server.to(conversationId).emit('deleteMessage', message);
    }
  }

  handleRevokeMessage(message: Message, server: Server) {
    const conversationId = message.conversation?.toString();
    if (conversationId) {
      server.to(conversationId).emit('revokeMessage', message);
    }
  }

  handleReactToMessage(message: Message, server: Server) {
    server.to(message.conversation.toString()).emit('reactToMessage', message);
  }

  handleUnReactToMessage(message: Message, server: Server) {
    const conversationId = message.conversation?.toString();
    if (conversationId) {
      server.to(conversationId).emit('unReactToMessage', message);
    }
    server
      .to(message.conversation.toString())
      .emit('unReactToMessage', message);
  }
}
