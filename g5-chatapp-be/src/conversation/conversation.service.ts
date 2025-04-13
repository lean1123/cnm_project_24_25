import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { ConvensationRequest } from './dto/requests/convensation.request';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { Convensation } from './schema/convensation.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Convensation.name)
    private convenstationModel: mongoose.Model<Convensation>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
  ) {}

  async createConvensation(
    conversation: ConvensationRequest,
  ): Promise<Convensation> {
    const members = conversation.members;
    let isGroup: boolean;
    let groupName;

    if (members.length <= 2 && members.length > 0) {
      isGroup = false;
    } else {
      isGroup = true;
    }

    if (isGroup === false) {
      const existedConversation = await this.convenstationModel.findOne({
        members: { $all: members.map((m) => m) },
        isGroup: false,
      });

      if (existedConversation) {
        throw new Error('Conversation is already existed');
      }
    }

    if (isGroup === true) {
      groupName = conversation.name;
      if (groupName === null || groupName === '') {
        throw new Error('Group name is required');
      }
      const existedGroup = await this.convenstationModel.findOne({
        name: groupName,
        isGroup: true,
      });

      if (existedGroup) {
        throw new Error('Group name is already existed');
      }
    }
    conversation.isGroup = isGroup;
    conversation.lastMessage = null;
    conversation.profilePicture = null;

    const res = await this.convenstationModel.create(conversation);

    return res;
  }

  async getConvensationById(id: string): Promise<Convensation> {
    return await this.convenstationModel
      .findById(id)
      .populate('members', 'firstName lastName email avatar')
      .populate('admin', 'firstName lastName email avatar')
      .populate({
        path: 'lastMessage',
        select: 'sender content type files',
        populate: {
          path: 'sender',
          select: 'firstName lastName',
        },
      })
      .exec();
  }

  async getConvensationByMemberForChatDirect(
    members: Types.ObjectId[],
  ): Promise<Convensation> {
    return await this.convenstationModel.findOne({
      members: { $all: members },
      is_group: false,
    });
  }

  async getConvensationByMemberForChatGroup(
    members: Types.ObjectId[],
  ): Promise<Convensation> {
    return await this.convenstationModel.findOne({
      members: { $all: members },
      is_group: true,
    });
  }

  async getAllConvensation(): Promise<Convensation[]> {
    return await this.convenstationModel.find().exec();
  }

  async getMyConversation(userPayload: JwtPayload): Promise<Convensation[]> {
    const user = await this.userService.findById(userPayload._id);
    if (!user) {
      throw new Error('User not found');
    }
    const conversations = await this.convenstationModel
      .find({
        members: new Types.ObjectId(userPayload._id.toString()),
      })
      .populate('members', 'firstName lastName email avatar')
      .populate('admin', 'firstName lastName email avatar')
      .populate({
        path: 'lastMessage',
        select: 'sender content type files',
        populate: {
          path: 'sender',
          select: 'firstName lastName',
        },
      })
      .exec();
    return conversations || [];
  }

  async getMyConversationId(userId: string): Promise<Types.ObjectId[]> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const conversations = await this.convenstationModel
      .find({
        members: new Types.ObjectId(userId),
      })
      .exec();
    return (
      conversations.map((conversation) => conversation._id as Types.ObjectId) ||
      []
    );
  }

  async updateConvensation(
    id: string,
    convensationRequest: ConvensationRequest,
  ): Promise<Convensation> {
    return await this.convenstationModel.findByIdAndUpdate(
      id,
      convensationRequest,
      { new: true },
    );
  }

  async updateLastMessageField(conversationId: string, messageId: string) {
    const message = await this.messageService.getMessageById(messageId);
    const sender = await this.userService.findById(message.sender.toString());
    if (!sender) {
      throw new Error('Sender not found in updateLastMessageField');
    }

    if (!message) {
      throw new Error('Message not found in updateLastMessageField');
    }
    const conversation = await this.convenstationModel.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found in updateLastMessageField');
    }

    await this.convenstationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });
  }
}
