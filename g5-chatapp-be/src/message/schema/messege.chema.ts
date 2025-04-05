import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Emotion } from './emotion.enum';
import { Sender } from './sender.schema';

@Schema({
  timestamps: true,
})
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Convensation' })
  conversation: Types.ObjectId;
  @Prop({ type: Sender, required: true })
  sender: Sender;
  @Prop({ required: true })
  content: string;
  @Prop({ type: [{ fileName: String, url: String }], required: false })
  files: [{ fileName: string; url: string }];
  @Prop({ type: [{ type: String, enum: Emotion }] })
  emotion: Emotion[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
