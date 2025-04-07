import { RedisModule } from 'src/redis/redis.module';
import { MailModule } from '../mail.module';
import { OtpService } from './otp.service';
import { forwardRef, Module } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => MailModule), RedisModule], // các module OtpService phụ thuộc
  providers: [OtpService],
  exports: [OtpService], // 👈 PHẢI export thì module khác mới dùng được
})
export class OtpModule {}
