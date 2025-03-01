import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Emotion } from './emotion.enum';

@Schema({
  timestamps: true,
})
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Convensation' })
  conversation: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop()
  media: string;
  @Prop()
  voice: string;
  @Prop({ type: [{ type: String, enum: Emotion }] })
  emotion: Emotion[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
