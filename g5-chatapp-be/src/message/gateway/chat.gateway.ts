import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { ContactResponseDto } from 'src/contact/dto/contactResponse.dto';
import { Contact } from 'src/contact/schema/contact.schema';
import { AdminRemoveMemberRequest } from 'src/conversation/dto/requests/adminRemoveMember.request';
import { Convensation } from 'src/conversation/schema/convensation.schema';
import { MessageRequest } from 'src/message/dtos/requests/message.request';
import { User } from 'src/user/schema/user.schema';
import { TypinationRequest } from '../dtos/requests/typination.request';
import { Message } from '../schema/messege.chema';
import { HandleCall } from './handleCall';
import { HandleContact } from './handleContact';
import { HandleConversation } from './handleConvsersation';
import { HandleMessage } from './handleMessage';
import { HandleConnection } from './handleConnection';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8081',
      'http://localhost:8082',
      'https://d3vkdcq3kcj9ec.cloudfront.net',
      'http://localhost:3001',
      'https://cnm-project-24-25.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private readonly conversationHandler: HandleConversation,
    private handleConnectionService: HandleConnection,
    private handleMessageService: HandleMessage,
    private handleContact: HandleContact,
    private handleCallService: HandleCall,
  ) {}

  private activeUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    this.activeUsers.forEach((value, key) => {
      if (value === client.id) {
        this.activeUsers.delete(key);
      }
    });

    for (const room of client.rooms) {
      await client.leave(room);
    }

    this.server.emit('activeUsers', {
      activeUsers: Array.from(this.activeUsers.keys()),
    });
  }

  @SubscribeMessage('login')
  async handleLogin(
    @MessageBody() { userId }: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.handleConnectionService.handleLogin(
      { userId },
      client,
      this.logger,
      this.activeUsers,
      this.server,
    );
  }

  @SubscribeMessage('join-qr-room')
  async handleJoinQrRoom(
    @MessageBody() { sessionId }: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(sessionId);
  }

  handleLoginByQrCodeResult(
    @MessageBody()
    {
      sessionId,
      user,
      token,
    }: {
      sessionId: string;
      user: { id: string; email: string };
      token: string;
    },
  ) {
    this.handleConnectionService.handleLoginByQrCodeResult(
      { sessionId, user, token },

      this.server,
    );
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody()
    {
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    await this.handleConnectionService.handleJoin(
      { userId, conversationId },
      client,
      this.logger,
      this.activeUsers,
    );
  }

  async handleMessage(
    @MessageBody()
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
  ) {
    await this.handleMessageService.handleMessage(
      {
        conversationId,
        user,
        messageDto,
        files,
      },
      this.server,
    );
  }

  handleForwardMessage(@MessageBody() messageForwarded: Message[]) {
    this.handleMessageService.handleForwardMessage(
      messageForwarded,
      this.server,
    );
  }

  handleDeleteMessage(@MessageBody() message: Message) {
    this.handleMessageService.handleDeleteMessage(message, this.server);
  }

  handleRevokeMessage(@MessageBody() message: Message) {
    this.handleMessageService.handleRevokeMessage(message, this.server);
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() typinationDto: TypinationRequest) {
    const { userId, conversationId } = typinationDto;

    // const user = await this.userService.findById(userId);
    // const fullName = `${user.firstName} ${user.lastName}`;

    this.server.to(conversationId).emit('typing', {
      userId: userId,
      // fullName: fullName,
      conversationId: conversationId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: TypinationRequest,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('stopTyping', {
      userId: data.userId,
    });
  }

  @SubscribeMessage('joinNewConversation')
  async handleJoinNewConversation(
    @MessageBody()
    { conversationId, userId }: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.handleContact.handleJoinNewConversation(
      { conversationId, userId },
      client,
      this.logger,
      this.activeUsers,
      this.server,
    );
  }
  @SubscribeMessage('sendRequestContact')
  handleRequestContact(
    @MessageBody()
    {
      receiverId,
      contact,
    }: {
      receiverId: string;
      contact: ContactResponseDto;
    },
  ) {
    this.handleContact.handleRequestContact(
      { receiverId, contact },
      this.logger,
      this.activeUsers,
      this.server,
    );
  }

  @SubscribeMessage('cancelRequestContact')
  handleCancelRequestContact(
    @MessageBody()
    { receiverId, contactId }: { receiverId: string; contactId: string },
  ) {
    this.handleContact.handleCancelRequestContact(
      { receiverId, contactId },
      this.logger,
      this.server,
      this.activeUsers,
    );
  }

  @SubscribeMessage('rejectRequestContact')
  handleRejectRequestContact(
    @MessageBody()
    {
      receiverId,
      name,
      contactId,
    }: {
      receiverId: string;
      name: string;
      contactId: string;
    },
  ) {
    this.handleContact.handleRejectRequestContact(
      { receiverId, name, contactId },
      this.server,
    );
  }

  handleAcceptRequestContact(
    @MessageBody()
    contact: Contact,
    conversation: string,
  ) {
    this.handleContact.handleAcceptRequestContact(
      contact,
      this.server,
      conversation,
    );
  }

  handleDeleteContact(
    @MessageBody()
    contact: Contact,
    conversation: string,
  ) {
    this.handleContact.handleDeleteContact(contact, this.server, conversation);
  }

  // call
  @SubscribeMessage('call')
  handleCall(
    @MessageBody()
    {
      sender,
      conversationId,
      type,
      isGroup,
    }: {
      sender: User;
      conversationId: string;
      type: string;
      isGroup: boolean;
    },
  ) {
    this.handleCallService.handleCall(
      { sender, conversationId, type, isGroup },
      this.server,
    );
  }

  @SubscribeMessage('joinCall')
  handleJoinCall(
    @MessageBody()
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
  ) {
    this.handleCallService.handleJoinCall(
      { userId, conversationId, isGroup },
      this.server,
    );
  }

  @SubscribeMessage('acceptCall')
  handleAcceptCall(
    @MessageBody()
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
  ) {
    this.handleCallService.handleAcceptCall(
      { userId, conversationId, isGroup },
      this.server,
    );
  }
  @SubscribeMessage('rejectCall')
  handleRejectCall(
    @MessageBody()
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
  ) {
    this.handleCallService.handleRejectCall(
      { userId, conversationId, isGroup },
      this.server,
    );
  }
  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody()
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
  ) {
    this.handleCallService.handleEndCall(
      { userId, conversationId, isGroup },
      this.server,
    );
  }
  @SubscribeMessage('cancelCall')
  handleCancelCall(
    @MessageBody()
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
  ) {
    this.handleCallService.handleCancelCall(
      { userId, conversationId, isGroup },
      this.server,
    );
  }

  handleReactToMessage(@MessageBody() message: Message) {
    this.handleMessageService.handleReactToMessage(message, this.server);
  }

  handleUnReactToMessage(@MessageBody() message: Message) {
    this.handleMessageService.handleUnReactToMessage(message, this.server);
  }
  @SubscribeMessage('createGroupConversation')
  handleCreateConversationForGroup(@MessageBody() conversation: Convensation) {
    this.conversationHandler.handleCreateConversationForGroupEvent(
      conversation,
      this.server,
    );
  }

  handleUpdateConversation(@MessageBody() conversation: Convensation) {
    this.conversationHandler.handleUpdateConversation(
      this.server,
      conversation,
    );
  }

  handleRemoveMemberFromConversation(
    @MessageBody() adminRemoveMember: AdminRemoveMemberRequest,
  ) {
    this.conversationHandler.handleRemoveMemberFromGroup(
      this.server,
      adminRemoveMember.memberId,
      adminRemoveMember.conversationId,
    );
  }

  handleDeleteConversation(
    @MessageBody() data: { conversation: Convensation; adminId: string },
  ) {
    this.conversationHandler.handleDeleteConversation(
      this.server,
      data.conversation,
      data.adminId,
    );
  }
}
