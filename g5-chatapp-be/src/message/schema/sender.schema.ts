import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

@Schema({ _id: false, timestamps: false }) // Nếu bạn không cần ObjectId riêng cho sender
export class Sender {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;
}

export const SenderSchema = SchemaFactory.createForClass(Sender);
