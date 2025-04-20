import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class HandleCall {
  constructor() {}
  handleCall(
    {
      sender,
      conversationId,
    }: {
      sender: User;
      conversationId: string;
    },
    server: Server,
  ) {
    server.to(conversationId).emit('goingCall', {
      sender,
    });
  }

  handleJoinCall(
    {
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    },
    server: Server,
  ) {
    server.to(conversationId).emit('newUser', {
      userId: userId,
    });
  }

  handleAcceptCall(
    {
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    },
    server: Server,
  ) {
    server.to(conversationId).emit('newUserJoinCall', {
      sender: userId,
    });
  }

  handleRejectCall(
    {
      userId,
      conversationId,
      callData,
    }: {
      userId: string;
      conversationId: string;
      callData: any;
    },
    server: Server,
  ) {
    server.to(userId).emit('rejectCall', {
      conversationId,
      callData,
    });
  }

  handleEndCall(
    {
      userId,
      conversationId,
      callData,
    }: {
      userId: string;
      conversationId: string;
      callData: any;
    },
    server: Server,
  ) {
    server.to(userId).emit('endCall', {
      conversationId,
      callData,
    });
  }

  handleCancelCall(
    {
      userId,
      conversationId,
      callData,
    }: {
      userId: string;
      conversationId: string;
      callData: any;
    },
    server: Server,
  ) {
    server.to(userId).emit('cancelCall', {
      conversationId,
      callData,
    });
  }

  handleNewUserStartCall(data: { to: string; sender: string }, server: Server) {
    server.to(data.to).emit('newUserJoinCall', {
      sender: data.sender,
    });
  }
}
