import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ConvensationService } from './convensation.service';
import { ConvensationRequest } from './dto/requests/convensation.request';

@Controller('convensation')
export class ConvensationController {
  constructor(private convensationService: ConvensationService) {}

  @Post()
  async createConvensation(@Body() convensationReq: ConvensationRequest) {
    try {
      return await this.convensationService.createConvensation(convensationReq);
    } catch (error) {
      throw new HttpException(error.message as String, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message as String, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async getConvensationById(@Param('id') id: string) {
    return await this.convensationService.getConvensationById(id);
  }

  @Get()
  async getAllConvensation() {
    return await this.convensationService.getAllConvensation();
  }

  @Get('/my-conversation/:userId')
  async getMyConversationBy(@Param('userId') userId: string) {
    return await this.convensationService.getMyConversation(userId);
  }
}
