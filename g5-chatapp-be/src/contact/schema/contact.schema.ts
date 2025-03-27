import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from '../enum/status.enum';
import { User } from 'src/users/schema/user.schema';

@Schema({
  timestamps: true,
})
export class Contact extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name, schema: User })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: User.name, schema: User })
  contactId: Types.ObjectId;
  @Prop({ type: String, enum: Status, default: Status.ACTIVE })
  status: Status;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
