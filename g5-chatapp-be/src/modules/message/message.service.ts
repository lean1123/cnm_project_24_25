import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageRequest } from './dtos/requests/message.request';
import { Message } from './schema/messege.chema';
import { UploadService } from 'src/upload/upload.service';
import { ConvensationService } from '../convensation/convensation.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    // private readonly userService: UsersService,
    private readonly convensationService: ConvensationService,
    private readonly uploadFileService: UploadService,
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

    const fileUrls = [];
    if (files.length > 0) {
      // Xử lý file
      for (const file of files) {
        await this.uploadFileService.uploadFile(file.originalname, file.buffer);
        fileUrls.push({
          fileName: file.originalname,
          url: await this.uploadFileService.getSignedFileUrl(file.originalname),
        });
      }
    }

    const messageSchema = {
      conversation: new Types.ObjectId(convensationId),
      sender: new Types.ObjectId(dto.sender_id),
      content: dto.content,
      emotion: dto.emotion || [],
      files: fileUrls || [],
    };

    const messageSaved = await this.messageModel.create(messageSchema);
    return messageSaved;
  }

  async getMessagesByConvensation(conversationId: string): Promise<Message[]> {
    return await this.messageModel.find({
      conversation: new Types.ObjectId(conversationId),
    });
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
