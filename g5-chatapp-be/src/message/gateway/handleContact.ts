import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ContactResponseDto } from 'src/contact/dto/contactResponse.dto';
import { Contact } from 'src/contact/schema/contact.schema';

@Injectable()
export class HandleContact {
  constructor() {}

  handleRequestContact(
    {
      receiverId,
      contact,
    }: {
      receiverId: string;
      contact: ContactResponseDto;
    },
    logger: Logger,
    activeUsers: Map<string, string>,
    server: Server,
  ) {
    // Log receiverId và kiểm tra activeUsers
    logger.log(
      `[Contact] Receiver ID: ${receiverId}, Active Users: ${JSON.stringify(Array.from(activeUsers))}`,
    );

    // Kiểm tra người nhận có online không
    if (!activeUsers.has(receiverId)) {
      logger.error(`[Contact] User ${receiverId} is offline`);
      return;
    }

    // Kiểm tra phòng receiverId có tồn tại không
    const receiverRoom = server.sockets.adapter.rooms.get(receiverId);
    logger.log(`[Contact] Receiver room exists: ${!!receiverRoom}`);

    // Gửi sự kiện
    server.to(receiverId).emit('newRequestContact', contact);
    logger.log(`[Contact] Event sent to ${receiverId}`);
  }

  handleCancelRequestContact(
    {
      receiverId,
      contactId,
    }: {
      receiverId: string;
      contactId: string;
    },
    logger: Logger,
    server: Server,
    activeUsers: Map<string, string>,
  ) {
    // Log receiverId và kiểm tra activeUsers
    logger.log(
      `[Contact] Receiver ID: ${receiverId}, Active Users: ${JSON.stringify(Array.from(activeUsers))}`,
    );
    server.to(receiverId).emit('cancelRequestContact', contactId);
  }

  handleRejectRequestContact(
    {
      receiverId,
      name,
      contactId,
    }: {
      receiverId: string;
      name: string;
      contactId: string;
    },
    server: Server,
  ) {
    server.to(receiverId).emit('rejectRequestContact', {
      contactId,
      name,
    });
  }

  handleAcceptRequestContact(
    contact: Contact,
    server: Server,
    conversation: string,
  ) {
    server.to(contact.user._id.toString()).emit('acceptRequestContact', {
      contactId: contact._id,
      conversation,
    });

    server.to(contact.contact._id.toString()).emit('acceptRequestContact', {
      contactId: contact._id,
      conversation,
    });
    console.log(
      `[Contact] Contact ${contact._id} accepted by ${contact.user.toString()}`,
    );
  }

  async handleJoinNewConversation(
    { conversationId, userId }: { conversationId: string; userId: string },
    client: Socket,
    logger: Logger,
    activeUsers: Map<string, string>,
    server: Server,
  ) {
    // Log receiverId và kiểm tra activeUsers
    logger.log(
      `[Contact] Receiver ID: ${userId}, Active Users: ${JSON.stringify(Array.from(activeUsers))}`,
    );

    // Kiểm tra người nhận có online không
    if (!activeUsers.has(userId)) {
      logger.error(`[Contact] User ${userId} is offline`);
      return;
    }

    // Kiểm tra phòng receiverId có tồn tại không
    const receiverRoom = server.sockets.adapter.rooms.get(userId);
    logger.log(`[Contact] Receiver room exists: ${!!receiverRoom}`);

    // Gửi sự kiện
    await client.join(conversationId);
    // server.to(userId).emit('joinNewConversation', conversationId);
  }
}
