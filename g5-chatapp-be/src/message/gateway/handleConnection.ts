import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';

@Injectable()
export class HandleConnection {
  constructor(private readonly conversationService: ConversationService) {}
  async handleLogin(
    { userId }: { userId: string },
    client: Socket,
    logger: Logger,
    activeUsers: Map<string, string>,
    server: Server,
  ) {
    logger.log(`User ${userId} logged in with socket ${client.id}`);
    activeUsers.set(userId, client.id);

    const conversations =
      await this.conversationService.getMyConversationId(userId);

    await client.join(userId.toString());
    logger.log(
      `User ${userId} joined to room ${userId} send notification with socket ${client.id}`,
    );
    for (const conversationId of conversations) {
      await client.join(conversationId.toString());
      logger.log(
        `User ${userId} joined room ${conversationId.toString()} with socket ${client.id}`,
      );
    }
    server.emit('activeUsers', {
      activeUsers: Array.from(activeUsers.keys()),
    });
  }

  async handleJoin(
    {
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    },
    client: Socket,
    logger: Logger,
    activeUsers: Map<string, string>,
  ) {
    await client.join(conversationId);
    activeUsers.set(userId, client.id);
    logger.log(`User ${userId} connected with socket ${client.id}`);
  }
}
