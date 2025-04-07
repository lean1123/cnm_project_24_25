import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailApi: TransactionalEmailsApi;

  constructor(private readonly userService: UsersService) {
    this.emailApi = new TransactionalEmailsApi();
    this.emailApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );
  }

  async sendOtp(toEmail: string, otp: string, fullName: string) {
    if (!toEmail) {
      this.logger.error('❌ Không có email để gửi OTP');
      throw new Error('Không có email để gửi OTP');
    }

    if (!otp) {
      this.logger.error('❌ Không có OTP để gửi');
      throw new Error('Không có OTP để gửi');
    }

    if (!fullName) {
      this.logger.error('❌ Không có tên đầy đủ để gửi');
      throw new Error('Không có tên đầy đủ để gửi');
    }

    const email = new SendSmtpEmail();

    email.subject = 'OTP Verification for Coconut Chat App';
    email.htmlContent = `
      <center>
  <img src="https://res.cloudinary.com/lean1123/image/upload/v1743915918/email-avarta_flly7g.jpg" width="150" alt="Coconut Chatting App" />
</center>

<h2 style="text-align:center;">
  {{params.fullName}}, Thank's for registered Coconut Chatting App!
</h2>

<center>
  <img src="https://res.cloudinary.com/lean1123/image/upload/v1743915918/email-avarta_flly7g.jpg" width="400" alt="Coconut Chatting App" />
</center>

<div style="background-color:#f1f1f1; padding:20px; text-align:center; margin: 30px 0;">
  <p>Your OTP Here!</p>
  <h1>{{ params.otp }}</h1>
</div>

<hr />

<p style="font-size: 12px; color: #555;">
  Coconut Co. Ltd<br />
  182/17C Hiep Binh Street, Hiep Binh Chanh Ward, 700000, Thanh Pho Ho Chi Minh
</p>

<p style="font-size: 11px; color: #999;">
  This email was sent to {{ params.email }}.<br />
  You’ve received this email because you registered to our app.<br />
  <a href="#">Unsubscribe</a>
</p>
`;
    email.sender = { name: 'G5 Chat App', email: 'lethanhan20039@gmail.com' };
    email.to = [{ email: toEmail }];
    email.params = {
      otp: otp,
      email: toEmail,
      fullName: fullName,
    };

    try {
      const result = await this.emailApi.sendTransacEmail(email);
      this.logger.log(`✅ Đã gửi OTP đến ${toEmail}`);
      return result;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`❌ Gửi email thất bại: ${error.message}`);
      this.logger.error('Api key: ', process.env.BREVO_API_KEY);
      throw err;
    }
  }
}
