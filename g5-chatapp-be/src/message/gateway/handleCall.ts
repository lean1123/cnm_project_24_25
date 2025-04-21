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
      type,
      isGroup
    }: {
      sender: User;
      conversationId: string;
      type: string;
      isGroup: boolean;
    },
    server: Server,
  ) {
    // tạo cuộc gọi với trạng thái đang gọi
    server.to(conversationId).emit('goingCall', {
      sender,
      type,
      conversationId,
      isGroup,
    });
  }

  handleJoinCall(
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
    server: Server,
  ) {
    // bỏ
  }

  handleAcceptCall(
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
    server: Server,
  ) {
    server.to(conversationId).emit('acceptCall', {
      userId,
      conversationId,
      isGroup,
    });
    // cập nhật người tham gia trong call
    // cập nhật trạng thái cuộc gọi
  }

  handleRejectCall(
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
    server: Server,
  ) {
    server.to(conversationId).emit('rejectCall', {
      userId,
      conversationId,
      isGroup,
    });
    // cập nhật trạng thái cuộc gọi đã từ chối
  }

  handleEndCall(
    {
      userId,
      conversationId,
      
    }: {
      userId: string;
      conversationId: string;
    },
    server: Server,
  ) {
    // server.to(userId).emit('endCall', {
    //   conversationId,
    // });
    // check còn người tham gia không
    // nếu không còn thì cập nhật trạng thái cuộc gọi đã kết thúc
    // cập nhật trạng thái cuộc gọi đã kết thúc
  }

  handleCancelCall(
    {
      userId,
      conversationId,
      isGroup,
    }: {
      userId: string;
      conversationId: string;
      isGroup: boolean;
    },
    server: Server,
  ) {
    server.to(conversationId).emit('cancelCall', {
      conversationId,
      userId,
      isGroup,
    });
  }

  handleNewUserStartCall(data: { to: string; sender: string }, server: Server) {
    server.to(data.to).emit('newUserJoinCall', {
      sender: data.sender,
    });
  }
}
