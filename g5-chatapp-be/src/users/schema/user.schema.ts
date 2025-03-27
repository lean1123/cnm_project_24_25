import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from 'src/auth/enums/gender.enum';
import { Role } from 'src/auth/enums/role.enum';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ type: [{ type: String, enum: Role }], default: [Role.USER] })
  role: Role[];
  @Prop()
  status: string;
  @Prop({ required: false })
  refreshToken: string;
  @Prop()
  gender: Gender;
}

export const UserSchema = SchemaFactory.createForClass(User);
