import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schema/messege.chema';
import { User } from 'src/users/schema/user.schema';
import { MessageRequest } from './dtos/requests/message.request';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createMessage(
    convensationId: string,
    message: MessageRequest,
  ): Promise<Message> {
    return await this.messageModel.create(message);
  }

  async getMessagesByConvensation(conversationId: string): Promise<Message[]> {
    return await this.messageModel.find({ conversation: conversationId });
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
