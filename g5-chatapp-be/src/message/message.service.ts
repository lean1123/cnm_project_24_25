import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schema/messege.chema';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createMessage(senderId: string, receiverId: string, message: string) {
    const newMessage = await this.messageModel.create({
      senderId,
      receiverId,
      message,
    });

    return newMessage;
  }
}
