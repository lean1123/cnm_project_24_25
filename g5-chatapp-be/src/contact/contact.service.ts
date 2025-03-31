import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConvensationService } from 'src/convensation/convensation.service';
import { UserService } from 'src/users/user.service';
import { Status } from './enum/status.enum';
import { Contact } from './schema/contact.schema';

@Injectable()
export class ContactService {
  constructor(
    private readonly userService: UserService,
    private readonly convensationService: ConvensationService,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
  ) {}

  async createContact(userId: string, contactId: string): Promise<Contact> {
    const user = await this.userService.findById(userId);
    const contact = await this.userService.findById(contactId);

    if (!user || !contact) {
      throw new NotFoundException('User not found');
    }

    const contactSchema = {
      userId: user._id,
      contactId: contact._id,
      status: Status.PENDING,
    };

    const savedContact = await this.contactModel.create(contactSchema);

    // const convensationSchema: ConvensationRequest = {
    //   isGroup: false,
    //   members: [userId, contactId],
    //   lastMessage: null,
    //   _id: null,
    //   name: null,
    //   profilePicture: null,
    //   admin: null,
    // };

    // await this.convensationService.createConvensation(convensationSchema);

    return savedContact;
  }

  async acceptContact(userId: string, contactId: string) {
    const contact = await this.contactModel.findOne({
      userId: new Types.ObjectId(userId),
      contactId: new Types.ObjectId(contactId),
    });

    if (!contact || contact.status === Status.ACTIVE) {
      throw new Error("Can't accept this contact");
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

    try {
      // Tạo cuộc trò chuyện nếu chưa có
      await this.convensationService.createConvensation({
        isGroup: false,
        members: [userId, contactId],
        lastMessage: null,
        _id: null,
        name: null,
        profilePicture: null,
        admin: null,
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }

    return updatedContact;
  }
}
