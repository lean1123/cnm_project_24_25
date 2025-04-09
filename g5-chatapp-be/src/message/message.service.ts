import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
// import { UploadService } from 'src/upload/upload.service';
import { UploadService } from 'src/upload/upload.service';
import { UserService } from 'src/user/user.service';
import { MessageRequest } from './dtos/requests/message.request';
import { Message } from './schema/messege.chema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    private readonly uploadFileService: UploadService,
    // private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createMessage(
    convensationId: string,
    dto: MessageRequest,
    files: Express.Multer.File[],
  ): Promise<Message> {
    const conversation =
      await this.conversationService.getConvensationById(convensationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const sender = await this.userService.findById(dto.sender_id.userId);

    if (!sender) {
      throw new NotFoundException('Sender not found in create new message');
    }

    // Kiểm tra người gửi có tồn tại trong participant không
    const isParticipant = conversation.members.some(
      (member) => member.userId.toString() === dto.sender_id.userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('User not in conversation');
    }

    let fileUrls = [];

    if (files) {
      fileUrls = await Promise.all(
        files.map(async (file) => {
          const url = await this.uploadFileService.uploadFile(
            file.originalname,
            file.buffer,
          );
          return { fileName: file.originalname, url };
        }),
      );
    }

    const messageSchema = {
      conversation: new Types.ObjectId(convensationId),
      sender: {
        userId: dto.sender_id.userId,
        fullName: `${sender.firstName} ${sender.lastName}`,
      },
      content: dto.content,
      emotion: dto.emotion || [],
      files: fileUrls || [],
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
}
