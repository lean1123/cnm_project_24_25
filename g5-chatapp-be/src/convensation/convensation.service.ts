import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { ConvensationRequest } from './dto/requests/convensation.request';
import { Convensation } from './schema/convensation.schema';

@Injectable()
export class ConvensationService {
  constructor(
    @InjectModel(Convensation.name)
    private convenstationModel: mongoose.Model<Convensation>,
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
  ) {}

  async createConvensation(
    conversation: ConvensationRequest,
  ): Promise<Convensation> {
    const res = await this.convenstationModel.create(conversation);
    return res;
  }

  async getConvensationById(id: string): Promise<Convensation> {
    return await this.convenstationModel.findById(id);
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
}
