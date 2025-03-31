import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserModule } from 'src/users/user.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { Contact, ContactSchema } from './schema/contact.schema';
import { ConvensationModule } from 'src/convensation/convensation.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    UserModule,
    ConvensationModule,
  ],
  providers: [
    ContactService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [ContactController],
  exports: [ContactService, MongooseModule],
})
export class ContactModule {}
