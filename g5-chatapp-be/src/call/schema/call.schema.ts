import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CallType } from './callType.enum';
import { CallStatus } from './callStatus.enum';
import { CallParticipant } from './callParticipants.schema';
import { CallQuality } from './callQuality.schema';
import { Convensation } from 'src/convensation/schema/convensation.schema';
import { User } from 'src/users/schema/user.schema';

@Schema({
  timestamps: true,
})
export class Call {
  @Prop({ type: Types.ObjectId, ref: Convensation.name })
  convensationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  callerId: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] })
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
  @Prop({ type: [Types.ObjectId], ref: CallParticipant.name })
  participants: Types.ObjectId[];
  @Prop({ type: CallQuality })
  call_quality: CallQuality;
  @Prop()
  record_url: string;
}

export const CallSchema = SchemaFactory.createForClass(Call);
