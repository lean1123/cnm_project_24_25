import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Call } from './schema/call.schema';
import { Model, Types } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { CallStatus } from './schema/callStatus.enum';

@Injectable()
export class CallService {
    constructor(
        @InjectModel(Call.name) private callModel: Model<Call>,
        private readonly conversationService: ConversationService,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
    ) {
        // Constructor logic if needed
    }
    
    async createCall(
        callerId: string,
        receiverIds: string[],
        type: string,
        conversationId: string,
    ) {
        const call = new this.callModel({
            callerId,
            receiverIds,
            type,
            conversationId,
            status: 'waiting',
            startTime: new Date(),
            currentParticipants: [new Types.ObjectId(callerId)],
        });
        await call.save();
    }
    
    async cancelCall(callId: string) {
        const call = await this.callModel.findById(callId);
        if (!call) {
            throw new Error('Call not found');
        }
        call.status = CallStatus.CANCELLED;
        await call.save();
    }

    async endCall(callId: string, userId: string) {
        const call = await this.callModel.findById(callId);
        if (!call) {
            throw new Error('Call not found');
        }
        if (call.status == CallStatus.CANCELLED || call.status == CallStatus.FINISHED) {
            throw new Error('Call has been cancelled or finished');
        }
        if (call.currentParticipants.length > 2) {
            call.currentParticipants = call.currentParticipants.filter(participant => participant != new Types.ObjectId(userId));
            await call.save();
            return;
        }
        call.status = CallStatus.FINISHED;
        call.endTime = new Date();
        call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000); // Duration in seconds
        await call.save();
    }
    
    async acceptCall(callId: string, userId: string) {
        const call = await this.callModel.findById(callId);
        if (!call) {
            throw new Error('Call not found');
        }
        if (call.status == CallStatus.CANCELLED || call.status == CallStatus.FINISHED) {
            throw new Error('Call has been cancelled or finished');
        }
        if (call.status == CallStatus.WAITING) {
            call.startTime = new Date();
        }

        call.status = CallStatus.ONGOING;
        call.participants.push(call.callerId);
        call.currentParticipants.push(new Types.ObjectId(userId));
        await call.save();
    }

    async rejectCall(callId: string, userId: string) {
        const call = await this.callModel.findById(callId);
        if (!call) {
            throw new Error('Call not found');
        }
        if (call.status == CallStatus.CANCELLED || call.status == CallStatus.FINISHED) {
            throw new Error('Call has been cancelled or finished');
        }
        if (call.status == CallStatus.WAITING) {
            call.status = CallStatus.REJECTED;
            call.endTime = new Date();
            call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000); // Duration in seconds
        }
    }
}
