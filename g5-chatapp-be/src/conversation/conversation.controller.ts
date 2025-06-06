import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationService } from './conversation.service';
import { ConvensationRequest } from './dto/requests/convensation.request';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { ChatGateway } from '../message/gateway/chat.gateway';
import { MemberAdditionRequest } from './dto/requests/MemberAddition.request';
import { MemberRemovationRequest } from './dto/requests/memberRemovation.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminChangeConversationDto } from './dto/requests/adminChange.dto';

@Controller('conversation')
export class ConvensationController {
  constructor(
    private convensationService: ConversationService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateWay: ChatGateway,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllConvensation() {
    return await this.convensationService.getAllConvensation();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async createConvensation(
    @UserDecorator() userPayload: JwtPayload,
    @Body() convensationReq: ConvensationRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const savedConversation = await this.convensationService.createConvensation(
      userPayload,
      convensationReq,
      file,
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
    this.chatGateWay.handleRemoveMemberFromConversation({
      conversationId: conversationId,
      memberId: memberRemove.memberId,
    });

    return updatedConversation;
  }

  @Post('leave/:conversationId')
  @UseGuards(AuthGuard('jwt'))
  async leaveGroupConversation(
    @UserDecorator() userPayload: JwtPayload,
    @Param('conversationId') conversationId: string,
  ) {
    const updatedConversation =
      await this.convensationService.leaveFromConversation(
        userPayload,
        conversationId,
      );

    this.chatGateWay.handleUpdateConversation(updatedConversation);

    return updatedConversation;
  }

  @Put('change-admin/:conversationId')
  @UseGuards(AuthGuard('jwt'))
  async changeAdmin(
    @UserDecorator() userPayload: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() memberToChange: AdminChangeConversationDto,
  ) {
    const updatedConversation = await this.convensationService.changeAdminRole(
      userPayload,
      conversationId,
      memberToChange.adminId,
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

  /**
   * delete Conversation -> hard delete -> remove conversation and all messages in this conversation
   * * @param userPayload
   * * @param conversationId
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteConvensation(
    @UserDecorator() userPayload: JwtPayload,
    @Param('id') id: string,
  ) {
    const deletedConversation =
      await this.convensationService.deleteConversation(userPayload, id);
    this.chatGateWay.handleDeleteConversation({
      conversation: deletedConversation,
      adminId: userPayload._id,
    });
    return deletedConversation;
  }

  /**
   * đổi role cho member trong group
   * @param userPayload
   * @param conversationId
   * @param memberId
   */
  @Post('change-role/:conversationId/:memberId')
  @UseGuards(AuthGuard('jwt'))
  async changeRoleMember(
    @UserDecorator() userPayload: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Param('memberId') memberId: string,
  ) {
    const updatedConversation = await this.convensationService.changeRoleMember(
      userPayload,
      conversationId,
      memberId,
    );
    this.chatGateWay.handleUpdateConversation(updatedConversation);
    return updatedConversation;
  }

  @Post('change-avatar/:conversationId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(
    @UserDecorator() userPayload: JwtPayload,
    @Param('conversationId') conversationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updatedConversation =
      await this.convensationService.changeAvatar(
        userPayload,
        conversationId,
        file,
      );

    this.chatGateWay.handleUpdateConversation(updatedConversation);

    return updatedConversation;
  }
}
