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

  constructor(private readonly chatService: MessageService) {}

  private activeUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

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
    console.log(`User ${userId} connected with socket ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    {
      conversationId,
      messageDto,
      files,
    }: {
      conversationId: string;
      messageDto: MessageRequest;
      files: Express.Multer.File[];
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage(
      conversationId,
      messageDto,
      files,
    );
    this.server.to(conversationId).emit('newMessage', message);
  }
}
