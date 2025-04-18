import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { ConversationRole } from './conversationRole.enum';

@Schema({
  timestamps: true,
})
export class Convensation extends Document {
  @Prop({ required: false })
  name: string;
  @Prop()
  profilePicture: string;
  @Prop({ required: true })
  isGroup: boolean;
  @Prop({ ref: User.name, schema: User, type: Types.ObjectId })
  admin: Types.ObjectId;
  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: Object.values(ConversationRole),
          required: true,
        },
      },
    ],
    required: true,
  })
  members: { user: Types.ObjectId; role: ConversationRole }[];
  @Prop({ type: Types.ObjectId, ref: 'Message', required: false })
  lastMessage: Types.ObjectId;
}

export const ConvensationSchema = SchemaFactory.createForClass(Convensation);
