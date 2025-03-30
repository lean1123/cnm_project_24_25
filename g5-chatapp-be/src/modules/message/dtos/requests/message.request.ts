import { Optional } from '@nestjs/common';

export class MessageRequest {
  @Optional()
  conversation_id?: string; // Nếu chưa có, hệ thống sẽ kiểm tra hoặc tạo mới

  sender_id: string;
  content: string;

  @Optional()
  emotion?: string[];
}
