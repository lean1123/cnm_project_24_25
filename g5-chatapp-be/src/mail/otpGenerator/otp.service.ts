import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { MailService } from '../mail.service';

@Injectable()
export class OtpService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {}

  generateOTP(length = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  async sendOTP(email: string, fullName: string, isForgot: boolean = false) {
    const otp = this.generateOTP();
    if (!isForgot) await this.redis.set(`otp:${email}`, otp, 'EX', 300);
    else await this.redis.set(`forgot-password-otp:${email}`, otp, 'EX', 300);
    await this.mailService.sendOtp(email, otp, fullName);
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }
    if (storedOtp === otp) {
      await this.redis.del(`otp:${email}`);
      return true;
    }
    return false;
  }
}
