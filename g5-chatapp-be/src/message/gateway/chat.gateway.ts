import { forwardRef, Inject, Logger } from '@nestjs/common';
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
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageRequest } from 'src/message/dtos/requests/message.request';
import { MessageService } from 'src/message/message.service';
import { Message } from '../schema/messege.chema';
import { TypinationRequest } from '../dtos/requests/typination.request';
import { UserService } from 'src/user/user.service';
import { ContactService } from '../../contact/contact.service';
import { User } from 'src/user/schema/user.schema';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://d3vkdcq3kcj9ec.cloudfront.net',
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
    private readonly chatService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ContactService))
    private readonly contactService: ContactService,
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
    this.logger.log(`User ${userId} logged in with socket ${client.id}`);
    this.activeUsers.set(userId, client.id);

    const conversations =
      await this.conversationService.getMyConversationId(userId);

    await client.join(userId.toString());
    this.logger.log(
      `User ${userId} joined to room ${userId} send notification with socket ${client.id}`,
    );
    for (const conversationId of conversations) {
      await client.join(conversationId.toString());
      this.logger.log(
        `User ${userId} joined room ${conversationId.toString()} with socket ${client.id}`,
      );
    }
    this.server.emit('activeUsers', {
      activeUsers: Array.from(this.activeUsers.keys()),
    });
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
    await client.join(conversationId);
    this.activeUsers.set(userId, client.id);
    this.logger.log(`User ${userId} connected with socket ${client.id}`);
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
    const message = await this.chatService.createMessage(
      conversationId,
      user,
      messageDto,
      files,
    );

    console.log('Message return: ', message);

    this.server.to(conversationId).emit('newMessage', message);
  }

  handleForwardMessage(@MessageBody() messageForwarded: Message[]) {
    for (const message of messageForwarded) {
      const conversationId = message.conversation?.toString();
      if (conversationId) {
        this.server.to(conversationId).emit('newMessage', message);
      }
    }
  }

  handleDeleteMessage(@MessageBody() message: Message) {
    const conversationId = message.conversation?.toString();
    if (conversationId) {
      this.server.to(conversationId).emit('deleteMessage', message);
    }
  }

  handleRevokeMessage(@MessageBody() message: Message) {
    const conversationId = message.conversation?.toString();
    if (conversationId) {
      this.server.to(conversationId).emit('revokeMessage', message);
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() typinationDto: TypinationRequest,
    @ConnectedSocket() client: Socket,
  ) {
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
    // Log receiverId và kiểm tra activeUsers
    this.logger.log(
      `[Contact] Receiver ID: ${receiverId}, Active Users: ${JSON.stringify(Array.from(this.activeUsers))}`,
    );

    // Kiểm tra người nhận có online không
    if (!this.activeUsers.has(receiverId)) {
      this.logger.error(`[Contact] User ${receiverId} is offline`);
      return;
    }

    // Kiểm tra phòng receiverId có tồn tại không
    const receiverRoom = this.server.sockets.adapter.rooms.get(receiverId);
    this.logger.log(`[Contact] Receiver room exists: ${!!receiverRoom}`);

    // Gửi sự kiện
    this.server.to(receiverId).emit('newRequestContact', contact);
    this.logger.log(`[Contact] Event sent to ${receiverId}`);
  }

  @SubscribeMessage('cancelRequestContact')
  handleCancelRequestContact(
    @MessageBody()
    { receiverId, contactId }: { receiverId: string; contactId: string },
  ) {
    // Log receiverId và kiểm tra activeUsers
    this.logger.log(
      `[Contact] Receiver ID: ${receiverId}, Active Users: ${JSON.stringify(Array.from(this.activeUsers))}`,
    );
    this.server.to(receiverId).emit('cancelRequestContact', contactId);
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
    this.server.to(receiverId).emit('rejectRequestContact', {
      contactId,
      name,
    });
  }

  // call
  @SubscribeMessage('call')
  handleCall(
    @MessageBody()
    { sender, conversationId }: { sender: User; conversationId: string},
  ) {
    this.server.to(conversationId).emit('goingCall', {
      sender,
    });
  }

  @SubscribeMessage('joinCall')
  handleJoinCall(
    @MessageBody()
    { userId, conversationId }: { userId: string; conversationId: string; },
  ) {
    this.server.to(conversationId).emit('newUser', {
      userId: userId,
    });
  }

  @SubscribeMessage('acceptCall')
  handleAcceptCall(
    @MessageBody()
    { userId, conversationId }: { userId: string; conversationId: string;},
  ) {
    this.server.to(conversationId).emit('newUserJoinCall', {
      sender: userId,
    });
  }
  @SubscribeMessage('rejectCall')
  handleRejectCall(
    @MessageBody()
    { userId, conversationId, callData }: { userId: string; conversationId: string; callData: any },
  ) {
    this.server.to(userId).emit('rejectCall', {
      conversationId,
      callData,
    });
  }
  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody()
    { userId, conversationId, callData }: { userId: string; conversationId: string; callData: any },
  ) {
    this.server.to(userId).emit('endCall', {
      conversationId,
      callData,
    });
  }
  @SubscribeMessage('cancelCall')
  handleCancelCall(
    @MessageBody()
    { userId, conversationId, callData }: { userId: string; conversationId: string; callData: any },
  ) {
    this.server.to(userId).emit('cancelCall', {
      conversationId,
      callData,
    });
  }

  @SubscribeMessage('newUserJoinCall')
  handleNewUserStartCall(
    @MessageBody()
    data: { to: string; sender: string},
  ) {
    this.server.to(data.to).emit('newUserJoinCall', {
      sender: data.sender,
    });
  }
  @SubscribeMessage('sdp')
  handleSdp(
    @MessageBody()
    data: { to: string; description: any; sender: string },
  ) {
    this.server.to(data.to).emit('sdp', {
      description: data.description,
      sender: data.sender,
    });
  }
  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @MessageBody()
    data: { to: string; candidate: any; sender: string },
  ) {
    this.server.to(data.to).emit('iceCandidate', {
      candidate: data.candidate,
      sender: data.sender,
    });
  }


  handleReactToMessage(@MessageBody() message: Message) {
    // const conversationId = message.conversation?.toString();
    // if (conversationId) {
    //   this.server.to(conversationId).emit('reactToMessage', message);
    // }
    this.server
      .to(message.conversation.toString())
      .emit('reactToMessage', message);
  }

  handleUnReactToMessage(@MessageBody() message: Message) {
    const conversationId = message.conversation?.toString();
    if (conversationId) {
      this.server.to(conversationId).emit('unReactToMessage', message);
    }
    this.server
      .to(message.conversation.toString())
      .emit('unReactToMessage', message);
  }

}
