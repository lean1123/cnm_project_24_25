import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

@Schema({
  timestamps: true,
})
export class CallParticipant {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId: Types.ObjectId;
  @Prop()
  joinAt: Date;
  @Prop()
  leaveAt: Date;
}

export const CallParticipantSchema =
  SchemaFactory.createForClass(CallParticipant);
