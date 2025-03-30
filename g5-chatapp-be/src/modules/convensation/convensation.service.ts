import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

import { ConvensationRequest } from './dto/requests/convensation.request';
import { Convensation } from './schema/convensation.schema';
import { UserService } from '../users/user.service';

@Injectable()
export class ConvensationService {
  constructor(
    @InjectModel(Convensation.name)
    private convenstationModel: mongoose.Model<Convensation>,
    private readonly userService: UserService,
  ) {}

  async createConvensation(
    conversation: ConvensationRequest,
  ): Promise<Convensation> {
    const members = conversation.members;
    let isGroup;
    let groupName;

    if (members.length <= 2 && members.length > 0) {
      isGroup = false;
    } else {
      isGroup = true;
    }

    if (isGroup === false) {
      const existedConversation = await this.convenstationModel.findOne({
        members: { $all: members },
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
    return await this.convenstationModel.findById({
      _id: new Types.ObjectId(id),
    });
  }

  async getConvensationByMember(members: string[]): Promise<Convensation> {
    return await this.convenstationModel.findOne({
      members: { $all: members },
      is_group: false,
    });
  }

  async getAllConvensation(): Promise<Convensation[]> {
    return await this.convenstationModel.find();
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
    await this.convenstationModel.findByIdAndUpdate(conversationId, {
      lastMessage: new Types.ObjectId(messageId),
    });
  }
}
