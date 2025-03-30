import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class CallQuality {
  @Prop()
  avgLatency: number;
  @Prop()
  packetLoss: number;
  @Prop()
  resolution: string;
}
export const CallQualitySchema = SchemaFactory.createForClass(CallQuality);
