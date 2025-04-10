import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { Status } from './enum/status.enum';
import { Contact } from './schema/contact.schema';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
  ) {}

  async createContact(
    userPayload: JwtPayload,
    contactDto: ContactDto,
  ): Promise<Contact> {
    const user = await this.userService.findById(userPayload._id);
    const contact = await this.userService.findById(contactDto.contactId);

    if (!user || !contact) {
      throw new NotFoundException('User not found');
    }

    const contactSchema = {
      userId: user._id,
      contactId: contact._id,
      status: Status.PENDING,
    };

    const savedContact = await this.contactModel.create(contactSchema);

    return savedContact;
  }

  async acceptContact(contactId: string): Promise<Contact> {
    const contact = await this.contactModel.findById(contactId).exec();

    if (!contact || contact.status === Status.ACTIVE) {
      throw new Error("Can't accept this contact or contact already accepted");
    }

    // Cập nhật trạng thái liên hệ
    const updatedContact = await this.contactModel.findByIdAndUpdate(
      contact._id,
      { status: Status.ACTIVE },
      { new: true },
    );

    if (!updatedContact) {
      throw new Error('Failed to update contact');
    }

    // Tìm thông tin người dùng
    const user = await this.userService.findById(contact.userId.toString());
    const contactUser = await this.userService.findById(
      contact.contactId.toString(),
    );

    if (!user || !contactUser) {
      throw new NotFoundException(
        'User not found to add new conversation for contact',
      );
    }

    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    const existingConversation =
      await this.conversationService.getConvensationByMemberForChatDirect([
        {
          userId: user._id as string,
          fullName: `${user.firstName} ${user.lastName}`,
        },
        {
          userId: contactUser._id as string,
          fullName: `${contactUser.firstName} ${contactUser.lastName}`,
        },
      ]);

    // Nếu chưa có cuộc trò chuyện, tạo mới
    if (!existingConversation) {
      try {
        await this.conversationService.createConvensation({
          isGroup: false,
          members: [
            {
              userId: user._id as string,
              fullName: `${user.firstName} ${user.lastName}`,
            },
            {
              userId: contactUser._id as string,
              fullName: `${contactUser.firstName} ${contactUser.lastName}`,
            },
          ],
          lastMessage: null,
          _id: null,
          name: null,
          profilePicture: null,
          admin: null,
        });
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }

    return updatedContact;
  }

  async getMyContact(userPayload: JwtPayload): Promise<Contact[]> {
    const user = await this.userService.findById(userPayload._id);
    if (!user) {
      throw new NotFoundException('User not found in get my contact');
    }
    const contacts = await this.contactModel
      .find({ userId: user._id, status: Status.ACTIVE })
      .exec();
    return contacts || [];
  }

  async getListAcceptedContact(userPayload: JwtPayload): Promise<Contact[]> {
    const user = await this.userService.findById(userPayload._id);
    if (!user) {
      throw new NotFoundException('User not found in get my contact');
    }
    const contacts = await this.contactModel
      .find({ userId: user._id, status: Status.INACTIVE })
      .exec();
    return contacts || [];
  }

  async getContactById(contactId: string): Promise<Contact> {
    return await this.contactModel.findById(contactId).exec();
  }
}
