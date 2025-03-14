import {
  Body,
  Controller,
  Get,
  HttpException,
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
      throw new HttpException(error.message as String, 400);
    }
  }

  @Put(':id')
  async updateConvensation(
    @Param('id') id: string,
    @Body() convensationReq: ConvensationRequest,
  ) {
    return await this.convensationService.updateConvensation(
      id,
      convensationReq,
    );
  }

  @Get(':id')
  async getConvensationById(@Param('id') id: string) {
    return await this.convensationService.getConvensationById(id);
  }

  @Get()
  async getAllConvensation() {
    return await this.convensationService.getAllConvensation();
  }
}
