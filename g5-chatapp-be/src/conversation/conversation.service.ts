import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { ConvensationRequest } from './dto/requests/convensation.request';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { Convensation } from './schema/convensation.schema';
import { MemberAdditionRequest } from './dto/requests/MemberAddition.request';

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
    userPayload: JwtPayload,
    conversation: ConvensationRequest,
  ): Promise<Convensation> {
    let members = conversation.members;
    const admin = await this.userService.findById(userPayload._id);
    const isExistedAdmin = members.includes(admin._id as string);

    if (!isExistedAdmin) {
      members = [...members, admin._id as string];
    }

    let isGroup: boolean;
    let groupName: string | undefined = conversation.name;

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
      const admin = await this.userService.findById(userPayload._id);

      groupName = conversation.name;
      if (!groupName) {
        const users = await Promise.all(
          members.map((member) => this.userService.findById(member)),
        );

        if (users.some((user) => !user)) {
          throw new Error('User not found in group conversation');
        }

        groupName = users.map((user) => user.lastName).join(', ');
      }

      const existedGroup = await this.convenstationModel.findOne({
        name: groupName,
        isGroup: true,
        members: { $all: members.map((m) => m) },
      });

      if (existedGroup) {
        throw new Error('Group is already existed');
      }

      conversation.admin = admin._id as string;
      conversation.name = groupName;
      conversation.members = members;
    }
    conversation.isGroup = isGroup;
    conversation.lastMessage = null;
    conversation.profilePicture = null;

    const res = await this.convenstationModel.create(conversation);

    return this.getConvensationById(res._id as string);
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
        members: userPayload._id,
      })
      .sort({ updatedAt: -1 })
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
    const sender = await this.userService.findById(
      message.sender._id.toString(),
    );
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

  async addMemberToGroupConversation(
    userPayload: JwtPayload,
    conversationId: string,
    newMemberIds: MemberAdditionRequest,
  ) {
    const conversation = await this.convenstationModel.findById(conversationId);
    if (!conversation || conversation.isGroup === false) {
      throw new Error('Conversation not found or is not a group conversation');
    }

    const isMember = conversation.members.includes(
      new Types.ObjectId(userPayload._id),
    );
    if (!isMember) {
      throw new Error('You are not a member of this conversation');
    }

    const members = conversation.members;
    const validUserChecks = await Promise.all(
      newMemberIds.newMemberIds.map(async (id) => {
        const exists = await this.userService.findById(id);
        return exists ? new Types.ObjectId(id) : null;
      }),
    );

    const existedMembers = validUserChecks.filter((member) =>
      members.includes(member),
    );

    if (existedMembers.length > 0) {
      throw new Error(
        ` ${existedMembers.join(', ')} are already in the group conversation`,
      );
    }

    const updatedConversation = await this.convenstationModel.findByIdAndUpdate(
      conversationId,
      { members: [...members, ...validUserChecks] },
      { new: true },
    );

    return this.getConvensationById(updatedConversation._id as string);
  }
}
