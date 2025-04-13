import { Convensation } from './../conversation/schema/convensation.schema';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
// import { UploadService } from 'src/upload/upload.service';
import { UploadService } from 'src/upload/upload.service';
import { UserService } from 'src/user/user.service';
import { MessageRequest } from './dtos/requests/message.request';
import { Message } from './schema/messege.chema';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { MessageType } from './schema/messageType.enum';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ConversationService))
    private readonly conversationService: ConversationService,
    private readonly uploadFileService: UploadService,
  ) {}

  async createMessage(
    convensationId: string,
    user: JwtPayload,
    dto: MessageRequest,
    files: Express.Multer.File[],
  ): Promise<Message> {
    const conversation =
      await this.conversationService.getConvensationById(convensationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const sender = await this.userService.findById(user._id);

    if (!sender) {
      throw new NotFoundException('Sender not found in create new message');
    }

    // Kiểm tra người gửi có tồn tại trong participant không
    const isParticipant = conversation.members.some(
      (member) => member.userId.toString() === user._id.toString(),
    );

    if (!isParticipant) {
      throw new NotFoundException('User not in conversation');
    }

    let fileUrls = [];
    let type: string = MessageType.TEXT; // Mặc định là TEXT

    if (files) {
      fileUrls = await Promise.all(
        files.map(async (file) => {
          const url = await this.uploadFileService.uploadFile(
            file.originalname,
            file.buffer,
          );

          if (file.mimetype.startsWith('image/')) {
            type = MessageType.IMAGE;
          }
          if (file.mimetype.startsWith('video/')) {
            type = MessageType.VIDEO;
          }
          if (file.mimetype.startsWith('audio/')) {
            type = MessageType.AUDIO;
          }
          if (file.mimetype.startsWith('application/')) {
            type = MessageType.FILE;
          }

          return { fileName: file.originalname, url };
        }),
      );
    }

    const messageSchema = {
      conversation: new Types.ObjectId(convensationId),
      sender: {
        userId: user._id,
        fullName: `${sender.firstName} ${sender.lastName}`,
      },
      content: dto.content,
      files: fileUrls || [],
      type,
    };

    const messageSaved = await this.messageModel.create(messageSchema);
    await this.conversationService.updateLastMessageField(
      convensationId,
      messageSaved._id as string,
    );
    return messageSaved;
  }

  async getMessagesByConvensation(
    conversationId: string,
    page: number,
    limit: number = 20,
  ): Promise<{
    data: Message[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const [data, total] = await Promise.all([
      this.messageModel
        .find({ conversation: new Types.ObjectId(conversationId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.messageModel.countDocuments({
        conversation: new Types.ObjectId(conversationId),
      }),
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getNewestMessageByConversation(
    conversationId: string,
  ): Promise<Message[]> {
    return await this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 }) // Sắp xếp mới nhất trước
      .limit(20) // Giới hạn 20 tin nhắn
      .exec();
  }

  async getMessageById(messageId: string): Promise<Message> {
    return await this.messageModel.findById(messageId);
  }

  async updateMessage(
    messageId: string,
    message: MessageRequest,
  ): Promise<Message> {
    return await this.messageModel.findByIdAndUpdate(messageId, message, {
      new: true,
    });
  }

  async deleteMessage(messageId: string): Promise<Message> {
    return await this.messageModel.findByIdAndDelete(messageId);
  }

  // xoa msg -> an tin nhan o 1 ben
  async revokeMessage(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date(),
        },
        $addToSet: {
          deletedFor: userId,
        },
      },
      { new: true },
    );
  }

  // xoa msg -> an tin nhan o ca 2 ben
  async revokeMessageBoth(
    messageId: string,
    conversationId: string,
    userRequestId: string,
  ): Promise<Message> {
    const conversation =
      await this.conversationService.getConvensationById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // ✅ Lấy tất cả userId từ members
    const memberIds = conversation.members.map(
      (m) => new Types.ObjectId(m.userId),
    );

    const updatedMessage = await this.messageModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(messageId),
        'sender.userId': new Types.ObjectId(userRequestId), // Chỉ cho phép sender thu hồi
      },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date(),
        },
        $addToSet: {
          deletedFor: { $each: memberIds }, // ✅ Thêm toàn bộ userId
        },
      },
      { new: true },
    );

    if (!updatedMessage) {
      throw new NotFoundException(
        'Message not found or you are not the sender',
      );
    }

    return updatedMessage;
  }

  async forwardMessageToMultipleConversations(
    originalMessageId: string,
    newConversationIds: string[], // Mảng các ID của cuộc trò chuyện cần forward tới
    userRequestId: string, // ID người yêu cầu forward
  ): Promise<Message[]> {
    // Tìm tin nhắn gốc
    const originalMessage = await this.messageModel.findById(originalMessageId);
    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    // Duyệt qua tất cả các cuộc trò chuyện và forward tin nhắn
    const forwardedMessages = [];

    for (const newConversationId of newConversationIds) {
      // Tạo bản sao của tin nhắn gốc cho mỗi cuộc trò chuyện
      const forwardedMessage = await this.messageModel.create({
        conversation: new Types.ObjectId(newConversationId),
        sender: originalMessage.sender,
        content: originalMessage.content,
        files: originalMessage.files,
        type: originalMessage.type,
        forwardFrom: originalMessageId, // Đánh dấu tin nhắn gốc
      });

      // Lưu tin nhắn đã forward vào mảng để trả về sau
      forwardedMessages.push(forwardedMessage);
    }

    // Trả về tất cả các tin nhắn đã được forward
    return forwardedMessages;
  }
}
