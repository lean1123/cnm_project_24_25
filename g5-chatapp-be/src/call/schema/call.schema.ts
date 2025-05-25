import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CallStatus } from './callStatus.enum';
import { CallType } from './callType.enum';

@Schema({
  timestamps: true,
})
export class Call {
  @Prop({ type: Types.ObjectId, ref: 'Convensation' })
  conversationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  callerId: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  receiverIds: Types.ObjectId[];
  @Prop({ type: String, enum: CallType })
  type: CallType;
  @Prop({ type: String, enum: CallStatus })
  status: CallStatus;
  @Prop()
  startTime: Date;
  @Prop()
  endTime: Date;
  @Prop()
  duration: number;
  @Prop({ type: [Types.ObjectId], ref: 'User' })
  participants: Types.ObjectId[];
  @Prop({ type: [Types.ObjectId], ref: 'User' })
  currentParticipants: Types.ObjectId[];
}

export const CallSchema = SchemaFactory.createForClass(Call);
