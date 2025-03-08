import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

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
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], required: true })
  members: Types.ObjectId[];
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;
}

export const ConvensationSchema = SchemaFactory.createForClass(Convensation);
