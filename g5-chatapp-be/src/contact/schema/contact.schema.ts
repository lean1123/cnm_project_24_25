import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from '../enum/status.enum';

@Schema({
  timestamps: true,
})
export class Contact extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  contact: Types.ObjectId;
  @Prop({ type: String, enum: Status, default: Status.ACTIVE })
  status: Status;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
