import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Member } from './member.schema';
import { LastMessage } from './lastMessage.schema';

@Schema({
  timestamps: true,
})
export class Convensation {
  @Prop({ required: false })
  name: string;
  @Prop()
  profilePicture: string;
  @Prop({ required: true })
  isGroup: boolean;
  @Prop({ ref: User.name, schema: User, type: Types.ObjectId })
  admin: Types.ObjectId;
  @Prop({ type: [Member], required: true })
  members: Member[];
  @Prop({ type: LastMessage, required: false })
  lastMessage: LastMessage;
}

export const ConvensationSchema = SchemaFactory.createForClass(Convensation);
