import {
  Body,
  Controller,
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

@Controller('conversation')
export class ConvensationController {
  constructor(private convensationService: ConversationService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllConvensation() {
    return await this.convensationService.getAllConvensation();
  }

  @Post()
  async createConvensation(@Body() convensationReq: ConvensationRequest) {
    try {
      return await this.convensationService.createConvensation(convensationReq);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
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
