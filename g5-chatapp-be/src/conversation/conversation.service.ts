import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { ConvensationRequest } from './dto/requests/convensation.request';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { Convensation } from './schema/convensation.schema';
import { MemberAdditionRequest } from './dto/requests/MemberAddition.request';
import { ConversationRole } from './schema/conversationRole.enum';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Convensation.name)
    private convenstationModel: mongoose.Model<Convensation>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createConvensation(
    userPayload: JwtPayload,
    conversation: ConvensationRequest,
    file: Express.Multer.File,
  ): Promise<Convensation> {
    const adminUser = await this.userService.findById(userPayload._id);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    let memberIds = conversation.members;

    const isExistedAdmin = memberIds.some((id) =>
      new Types.ObjectId(id).equals(adminUser._id as Types.ObjectId),
    );

    if (!isExistedAdmin) {
      memberIds = [...memberIds, adminUser._id as string];
    }

    const uniqueMemberIds = [...new Set(memberIds)];
    const users = await Promise.all(
      uniqueMemberIds.map((id) => this.userService.findById(id)),
    );

    if (users.some((u) => !u)) {
      throw new Error('Some members not found');
    }

    const membersWithRole = users.map((user) => ({
      user: user._id,
      role: (user._id as Types.ObjectId).equals(adminUser._id as Types.ObjectId)
        ? ConversationRole.ADMIN
        : ConversationRole.MEMBER,
    }));

    const isGroup = uniqueMemberIds.length > 2;

    if (!isGroup) {
      const existedConversation = await this.convenstationModel.findOne({
        isGroup: false,
        'members.user': {
          $all: uniqueMemberIds.map((id) => new Types.ObjectId(id)),
        },
      });

      if (existedConversation) {
        throw new Error('Conversation already exists');
      }
    } else {
      if (!conversation.name) {
        const name = users.map((u) => u.lastName).join(', ');
        conversation.name = name;
      }

      if (file) {
        const uploadedResult = await this.cloudinaryService.uploadFile(file);
        conversation.profilePicture = uploadedResult.url;
      }

      const existedGroup = await this.convenstationModel.findOne({
        isGroup: true,
        name: conversation.name,
        'members.user': {
          $all: uniqueMemberIds.map((id) => new Types.ObjectId(id)),
        },
      });

      if (existedGroup) {
        throw new Error('Group with same name and members already exists');
      }
    }

    const newConversation = await this.convenstationModel.create({
      name: conversation.name ?? null,
      isGroup,
      profilePicture: conversation.profilePicture ?? null,
      lastMessage: null,
      members: membersWithRole,
    });

    return this.getConvensationById(newConversation._id as string);
  }

  async getConvensationById(id: string): Promise<Convensation> {
    return await this.convenstationModel
      .findById(id)
      .populate('members.user', 'firstName lastName email avatar')
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
      isGroup: false,
      'members.user': { $all: members },
      $expr: { $eq: [{ $size: '$members' }, 2] },
    });
  }

  async getConvensationByMemberForChatGroup(
    members: Types.ObjectId[],
  ): Promise<Convensation> {
    return await this.convenstationModel.findOne({
      isGroup: true,
      'members.user': { $all: members },
      $expr: { $eq: [{ $size: '$members' }, members.length] },
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
        'members.user': userPayload._id,
      })
      .sort({ updatedAt: -1 })
      .populate('members.user', 'firstName lastName email avatar')
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
        'members.user': new Types.ObjectId(userId),
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

    const isMember = conversation.members.some((member) => {
      return member.user.equals(userPayload._id);
    });

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

    const filteredValidUserIds = validUserChecks.filter(
      (id): id is Types.ObjectId => id !== null,
    );

    const existedMembers = filteredValidUserIds.filter((id) =>
      members.some((member) => member.user.toString() === id.toString()),
    );

    if (existedMembers.length > 0) {
      throw new Error(
        `${existedMembers.join(', ')} are already in the group conversation`,
      );
    }

    // Mặc định role là MEMBER
    const newMembers = filteredValidUserIds.map((id) => ({
      user: id,
      role: ConversationRole.MEMBER,
    }));

    const updatedConversation = await this.convenstationModel.findByIdAndUpdate(
      conversationId,
      { members: [...members, ...newMembers] },
      { new: true },
    );

    return this.getConvensationById(updatedConversation._id as string);
  }

  async removeMemberFromGroupConversation(
    userPayload: JwtPayload,
    conversationId: string,
    memberId: string,
  ) {
    const conversation = await this.convenstationModel.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
      throw new Error('Conversation not found or is not a group');
    }

    const requesterId = new Types.ObjectId(userPayload._id);
    const targetMemberId = new Types.ObjectId(memberId);

    const isRequesterInGroup = conversation.members.some((m) =>
      m.user.equals(requesterId),
    );

    if (!isRequesterInGroup) {
      throw new Error('You are not a member of this conversation');
    }

    const isAdmin =
      conversation.members.find((m) => m.user.equals(requesterId))?.role ===
      ConversationRole.ADMIN;

    // Allow: admin removes others OR user removes self
    if (!isAdmin && !requesterId.equals(targetMemberId)) {
      throw new Error('Only admin can remove other members');
    }

    const isTargetInGroup = conversation.members.some((m) =>
      m.user.equals(targetMemberId),
    );

    if (!isTargetInGroup) {
      throw new Error('Target user is not in the group');
    }

    const updatedMembers = conversation.members.filter(
      (m) => !m.user.equals(targetMemberId),
    );

    // Optional: Prevent removing the last member
    if (updatedMembers.length === 0) {
      throw new Error('Cannot remove the last member from the group');
    }

    conversation.members = updatedMembers;
    await conversation.save();

    return this.getConvensationById(conversation._id as string);
  }
}
