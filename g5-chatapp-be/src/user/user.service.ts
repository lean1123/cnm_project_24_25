import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import mongoose from 'mongoose';
import { UserRequest } from './dto/requests/user.dto';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async create(user: User): Promise<User> {
    const res = await this.userModel.create(user);
    return res;
  }

  async findById(id: string): Promise<User> {
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }

  async update(
    userPayload: JwtPayload,
    user: UserRequest,
    file: Express.Multer.File,
  ): Promise<User> {
    const userId = userPayload._id;

    if (!userId) {
      throw new Error('User ID not found in payload');
    }

    const matchedUser = await this.userModel.findById(userId);

    if (!matchedUser) {
      throw new Error('User not found in update user');
    }

    let avatar: string | undefined = matchedUser.avatar;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      avatar = uploadResult.url;
    }

    const { firstName, lastName, dob, gender } = user;

    const updateUser = {
      firstName,
      lastName,
      dob,
      gender,
      avatar: avatar ? avatar : null,
    };

    return (await this.userModel
      .findByIdAndUpdate(userId, updateUser, {
        new: true,
      })
      .select('-password -role -refreshToken')) as User;
  }

  async changeAvatar(
    userPayload: JwtPayload,
    file: Express.Multer.File,
  ): Promise<User> {
    const userId = userPayload._id;

    if (!userId) {
      throw new Error('User ID not found in payload');
    }

    const matchedUser = await this.userModel.findById(userId);

    if (!matchedUser) {
      throw new Error('User not found in update user');
    }

    const uploadResult = await this.cloudinaryService.uploadFile(file);
    const avatar = uploadResult.url;

    return (await this.userModel
      .findByIdAndUpdate(
        userId,
        { avatar },
        {
          new: true,
        },
      )
      .select('-password -role -refreshToken')) as User;
  }
}
