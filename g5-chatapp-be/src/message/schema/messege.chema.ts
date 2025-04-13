import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MessageType } from './messageType.enum';

@Schema({
  timestamps: true,
})
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Convensation', required: true })
  conversation: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;
  @Prop({ required: false })
  content: string;
  @Prop({ type: [{ fileName: String, url: String }], required: false })
  files: [{ fileName: string; url: string }];

  // Chỉ ẩn tin nhắn đến đối với những user tồn tại trong mảng này
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [], required: false })
  deletedFor: Types.ObjectId[];

  // Tin nhắn đã bị thu hồi trong cuộc thoại
  @Prop({ default: false })
  isRevoked: boolean;
  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
    default: null,
    required: false,
  })
  forwardFrom: Types.ObjectId;
  @Prop({ type: String, default: [], required: false })
  type: MessageType;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
