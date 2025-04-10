import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { MailService } from './mail.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
