import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

import { ConvensationRequest } from './dto/requests/convensation.request';
import { Convensation } from './schema/convensation.schema';
import { User } from '../users/schema/user.schema';

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
}
