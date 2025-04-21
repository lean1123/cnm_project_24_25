import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { ContactDto } from './dto/contact.dto';
import { Status } from './enum/status.enum';
import { Contact } from './schema/contact.schema';

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

    const matchedContact = await this.contactModel.findOne({
      user: user._id,
      contact: contact._id,
    });

    if (matchedContact && matchedContact.status !== Status.ACTIVE) {
      const updatedContact = await this.contactModel.findByIdAndUpdate(
        matchedContact._id,
        { status: Status.PENDING },
        { new: true },
      );

      return this.getContactById(updatedContact._id as string);
    }

    const contactSchema = {
      user: user._id,
      contact: contact._id,
      status: Status.PENDING,
    };

    const savedContact = await this.contactModel.create(contactSchema);

    return this.getContactById(savedContact._id as string);
  }

  async acceptContact(
    userPayload: JwtPayload,
    contactId: string,
  ): Promise<{ updatedContact: Contact; newConversationId: string }> {
    const contact = await this.contactModel.findById(contactId).exec();

    if (!contact || contact.status === Status.ACTIVE) {
      throw new Error("Can't accept this contact or contact already accepted");
    }

    // Kiểm tra xem người dùng có quyền chấp nhận liên hệ không
    const acceptByUser = await this.userService.findById(userPayload._id);
    if (!acceptByUser) {
      throw new NotFoundException('User not found in accept contact');
    }

    if (!contact.contact.equals(acceptByUser._id as Types.ObjectId)) {
      throw new Error("You don't have permission to accept this contact");
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
    const user = await this.userService.findById(contact.user.toString());
    const contactUser = await this.userService.findById(
      contact.contact.toString(),
    );

    if (!user || !contactUser) {
      throw new NotFoundException(
        'User not found to add new conversation for contact',
      );
    }

    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    const existingConversation =
      await this.conversationService.getConvensationByMemberForChatDirect([
        user._id as Types.ObjectId,
        contactUser._id as Types.ObjectId,
      ]);

    // Nếu chưa có cuộc trò chuyện, tạo mới
    let newConversationId: string;
    if (!existingConversation) {
      try {
        const newConversation =
          await this.conversationService.createConvensation(
            userPayload,
            {
              isGroup: false,
              members: [user._id as string, contactUser._id as string],
              lastMessage: null,
              _id: null,
              name: null,
              profilePicture: null,
              admin: null,
            },
            undefined,
          );

        newConversationId = newConversation._id as string;
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }

    return {
      updatedContact: await this.getContactById(updatedContact._id as string),
      newConversationId,
    };
  }

  async getMyContact(userPayload: JwtPayload): Promise<Contact[]> {
    const user = await this.userService.findById(userPayload._id);
    if (!user) {
      throw new NotFoundException('User not found in get my contact');
    }
    const contacts = await this.contactModel
      .find({
        $or: [{ user: user._id }, { contact: user._id }],
        status: Status.ACTIVE,
      })
      .populate('user', 'firstName lastName email avatar')
      .populate('contact', 'firstName lastName email avatar')
      .exec();
    return contacts || [];
  }

  async getListAcceptedContact(userPayload: JwtPayload): Promise<Contact[]> {
    const user = await this.userService.findById(userPayload._id);
    if (!user) {
      throw new NotFoundException('User not found in get my contact');
    }
    const contacts = await this.contactModel
      .find({ user: user._id, status: Status.PENDING })
      .populate('user', 'firstName lastName email avatar')
      .populate('contact', 'firstName lastName email avatar')
      .exec();
    return contacts || [];
  }

  async getContactById(contactId: string): Promise<Contact> {
    return await this.contactModel
      .findById(contactId)
      .populate('user', 'firstName lastName email avatar')
      .populate('contact', 'firstName lastName email avatar')
      .exec();
  }

  async getListRequestContact(userPayload: JwtPayload): Promise<Contact[]> {
    const user = await this.userService.findById(userPayload._id);
    if (!user) {
      throw new NotFoundException('User not found in get my request contact');
    }
    const contacts = await this.contactModel
      .find({ contact: user._id, status: Status.PENDING })
      .populate('user', 'firstName lastName email avatar')
      .populate('contact', 'firstName lastName email avatar')
      .exec();
    return contacts || [];
  }

  async rejectContact(
    userPayload: JwtPayload,
    contactId: string,
  ): Promise<Contact> {
    const rejectByUser = await this.userService.findById(userPayload._id);

    if (!rejectByUser) {
      throw new NotFoundException('User not found in reject contact');
    }

    const contact = await this.contactModel.findById(contactId).exec();
    if (!contact || contact.status === Status.REJECT) {
      throw new Error("Can't reject this contact or contact already rejected");
    }

    if (!contact.contact.equals(rejectByUser._id as Types.ObjectId)) {
      throw new Error("You don't have permission to reject this contact");
    }

    // Cập nhật trạng thái liên hệ

    const updatedContact = await this.contactModel.findByIdAndUpdate(
      contact._id,
      { status: Status.REJECT },
      { new: true },
    );
    if (!updatedContact) {
      throw new Error('Failed to update contact in reject contact');
    }

    return updatedContact;
  }

  async cancelContact(
    userPayload: JwtPayload,
    contactId: string,
  ): Promise<Contact> {
    const cancelByUser = await this.userService.findById(userPayload._id);

    if (!cancelByUser) {
      throw new NotFoundException('User not found in cancel contact');
    }

    const contact = await this.contactModel.findById(contactId).exec();
    if (!contact || contact.status === Status.CANCEL) {
      throw new Error("Can't cancel this contact or contact already cancelled");
    }

    if (!contact.user.equals(cancelByUser._id as Types.ObjectId)) {
      throw new Error("You don't have permission to cancel this contact");
    }

    // Cập nhật trạng thái liên hệ
    const updatedContact = await this.contactModel.findByIdAndUpdate(
      contact._id,
      { status: Status.CANCEL },
      { new: true },
    );
    if (!updatedContact) {
      throw new Error('Failed to update contact in cancel contact');
    }

    return updatedContact;
  }
}
