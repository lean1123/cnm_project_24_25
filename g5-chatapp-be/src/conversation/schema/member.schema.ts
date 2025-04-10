import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

@Schema({
  timestamps: false,
})
export class Member {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;
}
export const MemberSchema = SchemaFactory.createForClass(Member);
