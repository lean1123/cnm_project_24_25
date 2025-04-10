import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
})
export class LastMessage {
  @Prop({ required: true })
  sender: string;
  @Prop({ required: true })
  message: string;
  @Prop({ required: true })
  createdAt: Date;
}
export const LastMessageSchema = SchemaFactory.createForClass(LastMessage);
