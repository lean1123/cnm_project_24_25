import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';
import { Convensation } from 'src/conversation/schema/convensation.schema';

@Injectable()
export class HandleConversation {
  constructor(private readonly conversationService: ConversationService) {}

  handleCreateConversationForGroup(conversation: Convensation, server: Server) {
    const conversationId = conversation._id as string;
    if (conversationId) {
      server.to(conversationId).emit('createConversationForGroup', {
        conversation: conversation,
      });
    }
  }

  handleUpdateConversation(server: Server, conversation: Convensation) {
    const conversationId = conversation._id as string;
    if (conversationId) {
      server.to(conversationId).emit('updateConversation', {
        conversation: conversation,
      });
    }
  }
}
