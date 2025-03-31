import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác nhận tài khoản',
      text: `Mã xác nhận của bạn là: ${code}`,
      html: `<p>Mã xác nhận của bạn là: <b>${code}</b></p>`,
    });
    console.log(`Email xác nhận đã gửi đến ${email}`);
  }
}
