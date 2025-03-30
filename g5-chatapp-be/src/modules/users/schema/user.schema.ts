import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, mongo } from 'mongoose';
import { Gender } from 'src/common/enums/gender.enum';
import { Role } from 'src/common/enums/role.enum';
import mongoose from 'mongoose';
export type UserDocument = HydratedDocument<User>;
@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true })
  full_name: String;
  @Prop()
  dob?: Date;
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({ type: [{ type: String, enum: Role }], default: [Role.USER] })
  role: Role[];
  @Prop({ default: 'active' })
  status: string;
  @Prop()
  gender: Gender;
  @Prop()
  profile_picture?: string;
  @Prop({ unique: true, required: true })
  phone: string;
  @Prop()
  bio?: string;
  @Prop()
  password: string;
  @Prop({ default: 'LOCAL' })
  account_type: string;
  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: null }) // Chỉ lưu một Refresh Token gần nhất
  refresh_token?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  friends: User[];

  @Prop()
  code: string; // Sinh code gửi qua mail hoặc phone -> forget pass

  @Prop()
  code_expired: Date; // set thời gian sống cho code_id
}
export const UserSchema = SchemaFactory.createForClass(User);
