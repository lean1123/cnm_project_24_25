import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';
import { Convensation } from 'src/conversation/schema/convensation.schema';

@Injectable()
export class HandleConversation {
  constructor(private readonly conversationService: ConversationService) {}

  handleCreateConversationForGroupEvent(
    conversation: Convensation,
    server: Server,
  ) {
    const conversationId = conversation._id as string;
    if (conversationId) {
      // server.to(conversationId).emit('createConversationForGroup', {
      //   conversation: conversation,
      // });
      for (const member of conversation.members) {
        const userId = member.user._id.toString();
        if (userId) {
          server.to(userId).emit('createConversationForGroup', {
            conversation: conversation,
          });
          console.log(
            `[Conversation] User ${userId} joined conversation ${conversationId}`,
          );
        }
      }
    }
  }

  handleUpdateConversation(server: Server, conversation: Convensation) {
    const conversationId = conversation._id as string;
    if (conversationId) {
      server.to(conversationId).emit('updateConversation', {
        conversation: conversation,
      });
      for (const member of conversation.members) {
        const userId = member.user._id.toString();
        if (userId) {
          server.to(userId).emit('updateConversation', {
            conversation: conversation,
          });
          console.log(
            `[Conversation] User ${userId} updated conversation ${conversationId}`,
          );
        }
      }
    }
  }

  handleRemoveMemberFromGroup(
    server: Server,
    memberId: string,
    conversationId: string,
  ){
    server.to(memberId).emit('removedGroupByAdmin', {
      memberId: memberId,
      conversationId: conversationId,
    });
  }

  handleDeleteConversation(
    server: Server,
    conversation: Convensation,
    adminId: string,
  ) {
    const conversationId = conversation._id as string;
    if (conversationId) {
      server.to(conversationId).emit('dissolvedGroup', {
        conversation: conversation,
        adminId
      });
      for (const member of conversation.members) {
        const userId = member.user._id.toString();
        if (userId) {
          server.to(userId).emit('dissolvedGroup', {
            conversation: conversation,
            adminId
          });
          console.log(
            `[Conversation] User ${userId} deleted conversation ${conversationId}`,
          );
        }
      }
    }
  }
  // async handleJoinNewConversation(
  //   { conversationId, userId }: { conversationId: string; userId: string },
  //   server: Server,
  //   client: Socket,
  //   logger: Logger,
  //   activeUsers: Map<string, string>,
  // ) {
  //   // Log receiverId và kiểm tra activeUsers
  //   logger.log(
  //     `[Conversation] Receiver ID: ${conversationId}, Active Users: ${JSON.stringify(
  //       Array.from(activeUsers),
  //     )}`,
  //   );

  //   // Kiểm tra người nhận có online không
  //   if (!activeUsers.has(userId)) {
  //     logger.error(`[Conversation] User ${userId} is offline`);
  //     return;
  //   }

  //   // Kiểm tra phòng receiverId có tồn tại không
  //   const receiverRoom = server.sockets.adapter.rooms.get(conversationId);
  //   logger.log(`[Conversation] Receiver room exists: ${!!receiverRoom}`);

  //   // Gửi sự kiện
  //   server.to(conversationId).emit('joinNewConversation', conversationId);
  //   await client.join(conversationId);
  // }
}
