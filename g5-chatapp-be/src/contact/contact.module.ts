import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConvensationModule } from 'src/convensation/convensation.module';
import { MessageModule } from 'src/message/message.module';
import { UsersModule } from 'src/users/users.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { Contact, ContactSchema } from './schema/contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    UsersModule,
    ConvensationModule,
    MessageModule,
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
