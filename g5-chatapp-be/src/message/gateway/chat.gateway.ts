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
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageRequest } from 'src/message/dtos/requests/message.request';
import { MessageService } from 'src/message/message.service';
import { Message } from '../schema/messege.chema';
import { TypinationRequest } from '../dtos/requests/typination.request';
import { UserService } from 'src/user/user.service';

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

    const user = await this.userService.findById(userId);
    const fullName = `${user.firstName} ${user.lastName}`;

    client.to(conversationId).emit('typing', fullName);
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
}
