import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload-test')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      return await this.uploadService.uploadFile(
        file.originalname,
        file.buffer,
        file.mimetype,
      );
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
