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
import { MessageRequest } from 'src/message/dtos/requests/message.request';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: MessageService) {}

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

  @SubscribeMessage('sendMessage')
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
}
