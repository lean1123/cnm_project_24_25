import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { UploadService } from 'src/upload/upload.service';
import { UserService } from 'src/user/user.service';
import { MessageRequest } from './dtos/requests/message.request';
import { MessageForwardationRequest } from './dtos/requests/messageForwardation.request';
import { MessageType } from './schema/messageType.enum';
import { Message } from './schema/messege.chema';
import { MessageReactionRequest } from './dtos/requests/messageReaction.request';

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
    const isParticipant = conversation.members.some((member) =>
      member._id.equals(sender._id as Types.ObjectId),
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
      sender: sender._id,
      content: dto.content,
      files: fileUrls || [],
      type,
    };

    const messageSaved = await (
      await this.messageModel.create(messageSchema)
    ).populate('sender', 'firstName lastName email avatar');

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
        .populate('sender', 'firstName lastName email avatar')
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
      .populate('sender', 'firstName lastName email avatar')
      .sort({ createdAt: 1 }) // Sắp xếp mới nhất trước
      .limit(20) // Giới hạn 20 tin nhắn
      .exec();
  }

  async getMessageById(messageId: string): Promise<Message> {
    return await this.messageModel
      .findById(messageId)
      .populate('sender', 'firstName lastName email avatar');
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

    const deletedFor = message.deletedFor || [];
    const isDeletedForUser = deletedFor.some(
      (user) => String(user) === String(userId),
    );

    if (isDeletedForUser) {
      throw new NotFoundException('Message already deleted for this user');
    }

    return await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $set: {
          updatedAt: new Date(),
        },
        $addToSet: {
          deletedFor: userId, // ✅ Thêm userId vào mảng deletedFor
        },
      },
      { new: true },
    );
  }

  // xoa msg -> an tin nhan o ca 2 ben
  async revokeMessageBoth(
    messageId: string,
    // conversationId: string,
    userRequestId: string,
  ): Promise<Message> {
    // const conversation =  await this.conversationService.getConvensationById(conversationId);

    // if (!conversation) {
    //   throw new NotFoundException('Conversation not found');
    // }

    // ✅ Lấy tất cả userId từ members
    // const memberIds = conversation.members;

    const updatedMessage = await this.messageModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(messageId),
        sender: new Types.ObjectId(userRequestId), // Chỉ cho phép sender thu hồi
      },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date(),
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
    messageForwardationDto: MessageForwardationRequest,
    userPayload: JwtPayload,
  ): Promise<Message[]> {
    // Tìm tin nhắn gốc
    const originalMessage = await this.messageModel.findById(
      messageForwardationDto.originalMessageId,
    );
    if (!originalMessage || originalMessage.isRevoked) {
      throw new NotFoundException(
        'Original message not found or has been revoked',
      );
    }

    const sender = await this.userService.findById(userPayload._id);

    // Duyệt qua tất cả các cuộc trò chuyện và forward tin nhắn
    const forwardedMessages = [];

    for (const newConversationId of messageForwardationDto.conversationIds) {
      // Kiểm tra xem cuộc trò chuyện có tồn tại không
      const conversation =
        await this.conversationService.getConvensationById(newConversationId);
      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${newConversationId} not found`,
        );
      }

      // Tạo bản sao của tin nhắn gốc cho mỗi cuộc trò chuyện
      const forwardedMessage = await this.messageModel.create({
        conversation: new Types.ObjectId(newConversationId),
        sender: sender._id,
        content: originalMessage.content,
        files: originalMessage.files,
        type: originalMessage.type,
        forwardFrom: originalMessage._id, // Đánh dấu tin nhắn gốc
      });

      // Lưu tin nhắn đã forward vào mảng để trả về sau
      forwardedMessages.push(forwardedMessage);

      // Cập nhật trường lastMessageId của cuộc trò chuyện

      await this.conversationService.updateLastMessageField(
        newConversationId,
        forwardedMessage._id as string,
      );
    }

    // Trả về tất cả các tin nhắn đã được forward
    return forwardedMessages as Message[];
  }

  async reactToMessage(
    userPayload: JwtPayload,
    messageReactionDto: MessageReactionRequest,
  ) {
    const matchedMessage = await this.messageModel.findById(
      messageReactionDto.messageId,
    );

    if (!matchedMessage) {
      throw new NotFoundException('Message not found to react');
    }

    const reacter = await this.userService.findById(userPayload._id);
    if (!reacter) {
      throw new NotFoundException('User not found to react');
    }

    // check user đã react chưa
    const existingReaction = matchedMessage.reactions.find((reaction) =>
      reaction.user.equals(reacter._id as Types.ObjectId),
    );

    if (existingReaction) {
      // Nếu đã có reaction, cập nhật lại reaction
      matchedMessage.reactions = matchedMessage.reactions.map((reaction) => {
        if (reaction.user.equals(reacter._id as Types.ObjectId)) {
          return { ...reaction, reaction: messageReactionDto.reaction };
        }
        return reaction;
      });
    } else {
      // Nếu chưa có reaction, thêm mới
      matchedMessage.reactions.push({
        user: reacter._id as Types.ObjectId,
        reaction: messageReactionDto.reaction,
      });
    }

    // Lưu lại tin nhắn đã được react

    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      matchedMessage._id,
      { reactions: matchedMessage.reactions },
      { new: true },
    );
    if (!updatedMessage) {
      throw new NotFoundException('Failed to update message reaction');
    }

    return updatedMessage.populate('sender', 'firstName lastName email avatar');
  }

  async unReactToMessage(userPayload: JwtPayload, messageId: string) {
    const matchedMessage = await this.messageModel.findById(
      new Types.ObjectId(messageId),
    );

    if (!matchedMessage) {
      throw new NotFoundException('Message not found to unreact');
    }

    const reacter = await this.userService.findById(userPayload._id);
    if (!reacter) {
      throw new NotFoundException('User not found to unreact');
    }

    // check user đã react chưa
    const existingReaction = matchedMessage.reactions.find((reaction) =>
      reaction.user.equals(reacter._id as Types.ObjectId),
    );

    if (!existingReaction) {
      throw new NotFoundException('User not reacted to this message yet');
    }

    // Nếu đã có reaction, xóa reaction
    matchedMessage.reactions = matchedMessage.reactions.filter(
      (reaction) => !reaction.user.equals(reacter._id as Types.ObjectId),
    );

    // Lưu lại tin nhắn đã được react

    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      matchedMessage._id,
      { reactions: matchedMessage.reactions },
      { new: true },
    );
    if (!updatedMessage) {
      throw new NotFoundException('Failed to update message reaction');
    }

    return updatedMessage.populate('sender', 'firstName lastName email avatar');
  }
}
