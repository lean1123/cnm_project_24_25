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

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [], required: false })
  deletedFor: Types.ObjectId[];

  @Prop({ default: false })
  isRevoked: boolean;
  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
    default: null,
    required: false,
  })
  forwardFrom: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    default: null,
    required: false,
  })
  forwardFromConversation: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
    default: null,
    required: false,
  })
  replyTo: Types.ObjectId;
  @Prop({ type: String, default: [], required: false })
  type: MessageType;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        reaction: { type: String, required: true },
      },
    ],
    default: [],
  })
  reactions: {
    user: Types.ObjectId;
    reaction: string;
  }[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
