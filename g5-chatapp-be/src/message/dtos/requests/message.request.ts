import { Optional } from '@nestjs/common';
import { Emotion } from 'src/message/schema/emotion.enum';

export class MessageRequest {
  @Optional()
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  @Optional()
  media: string;
  @Optional()
  voice: string;
  @Optional()
  emotion: Emotion[];
}
