import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';

import { CreateUserRequestDto } from './dto/requests/create-user.req.dto';
import { Model } from 'mongoose';
import { UserResponseDto } from './dto';
import { generateRandomCode, hashPlainTextHelper } from 'src/helpers';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private mailService: MailService,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };

  async findAllUser(): Promise<UserResponseDto[]> {
    return await this.userModel.find();
  }

  async createUser(userRequest: CreateUserRequestDto) {
    const {
      full_name,
      email,
      password,
      phone,
      profile_picture,
      gender,
      dob,
      bio,
    } = userRequest;

    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email already exists: ${email}. Please used other email!.`,
      );
    }
    //hash password
    const hashPassword = await hashPlainTextHelper(password);

    const code = generateRandomCode(6); // Generate a 6-character verification code
    const verificationExpires = new Date();
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 10); // Hết hạn sau 10 phút

    const user = await this.userModel.create({
      full_name,
      email,
      password: hashPassword,
      phone,
      profile_picture,
      bio,
      dob,
      gender,
      code,
      isActive: false,
      code_expired: verificationExpires,
    });
    await this.mailService.sendVerificationEmail(user.email, code);
    return {
      _id: user._id,
    };
  }
  async findUserById(id: string): Promise<UserResponseDto> {
    return await this.userModel.findById(id);
  }

  async findUserByCondition(condition: string): Promise<UserResponseDto> {
    const user = await this.userModel.findOne({
      $or: [{ phone: condition }, { email: condition }],
    });

    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    return {
      _id: user._id.toString(),
      full_name: user.full_name,
      dob: user.dob,
      email: user.email,
      role: user.role,
      status: user.status,
      gender: user.gender,
      profile_picture: user.profile_picture,
      phone: user.phone,
      bio: user.bio,
      account_type: user.account_type,
      isActive: user.isActive,
      friends: user.friends,
    };
  }

  async updateUserById(id: string, user: CreateUserRequestDto): Promise<any> {
    return await this.userModel.updateOne(
      { _id: id },
      { ...CreateUserRequestDto },
    );
  }

  async deleteUserById(id: string) {
    await this.userModel.findByIdAndDelete(id);
    return 'User deleted successfully';
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
}
