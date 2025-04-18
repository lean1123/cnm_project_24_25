import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationService } from './conversation.service';
import { ConvensationRequest } from './dto/requests/convensation.request';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { ChatGateway } from '../message/gateway/chat.gateway';
import { MemberAdditionRequest } from './dto/requests/MemberAddition.request';
import { MemberRemovationRequest } from './dto/requests/memberRemovation.request';

@Controller('conversation')
export class ConvensationController {
  constructor(
    private convensationService: ConversationService,
    private readonly chatGateWay: ChatGateway,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllConvensation() {
    return await this.convensationService.getAllConvensation();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createConvensation(
    @UserDecorator() userPayload: JwtPayload,
    @Body() convensationReq: ConvensationRequest,
  ) {
    const savedConversation = await this.convensationService.createConvensation(
      userPayload,
      convensationReq,
    );

    this.chatGateWay.handleCreateConversationForGroup(savedConversation);

    return savedConversation;
  }

  @Post('add-member/:conversationId')
  @UseGuards(AuthGuard('jwt'))
  async addMemberToGroupConversation(
    @UserDecorator() userPayload: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() memberAddition: MemberAdditionRequest,
  ) {
    const updatedConversation =
      await this.convensationService.addMemberToGroupConversation(
        userPayload,
        conversationId,
        memberAddition,
      );

    this.chatGateWay.handleUpdateConversation(updatedConversation);

    return updatedConversation;
  }

  @Delete('remove-member/:conversationId')
  @UseGuards(AuthGuard('jwt'))
  async removeMemberFromGroupConversation(
    @UserDecorator() userPayload: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() memberRemove: MemberRemovationRequest,
  ) {
    const updatedConversation =
      await this.convensationService.removeMemberFromGroupConversation(
        userPayload,
        conversationId,
        memberRemove.memberId,
      );

    this.chatGateWay.handleUpdateConversation(updatedConversation);

    return updatedConversation;
  }

  @Put(':id')
  async updateConvensation(
    @Param('id') id: string,
    @Body() convensationReq: ConvensationRequest,
  ) {
    try {
      return await this.convensationService.updateConvensation(
        id,
        convensationReq,
      );
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('my-conversation')
  @UseGuards(AuthGuard('jwt'))
  getMyConversation(@UserDecorator() userPayload: JwtPayload) {
    return this.convensationService.getMyConversation(userPayload);
  }

  @Get(':id')
  async getConvensationById(@Param('id') id: string) {
    return await this.convensationService.getConvensationById(id);
  }
}
