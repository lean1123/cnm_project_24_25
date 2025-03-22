import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConvensationService } from 'src/convensation/convensation.service';
// import { UploadService } from 'src/upload/upload.service';
import { UsersService } from 'src/users/users.service';
import { MessageRequest } from './dtos/requests/message.request';
import { Message } from './schema/messege.chema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly userService: UsersService,
    private readonly convensationService: ConvensationService,
    // private readonly uploadFileService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createMessage(
    convensationId: string,
    dto: MessageRequest,
    files: Express.Multer.File[],
  ): Promise<Message> {
    const conversation =
      await this.convensationService.getConvensationById(convensationId);

    // Nếu chưa có, tạo cuộc trò chuyện mới
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Kiểm tra người gửi có tồn tại trong participant không
    const isParticipant = conversation.members.includes(
      new Types.ObjectId(dto.sender_id),
    );
    if (!isParticipant) {
      throw new NotFoundException('User not in conversation');
    }

    let fileUrls = [];

    if (files) {
      fileUrls = await Promise.all(
        files.map(async (file) => {
          const { fileName, url } =
            await this.cloudinaryService.uploadFile(file);
          return { fileName, url };
        }),
      );
    }

    const messageSchema = {
      conversation: new Types.ObjectId(convensationId),
      sender: new Types.ObjectId(dto.sender_id),
      content: dto.content,
      emotion: dto.emotion || [],
      files: fileUrls || [],
    };

    const messageSaved = await this.messageModel.create(messageSchema);
    await this.convensationService.updateLastMessageField(
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
