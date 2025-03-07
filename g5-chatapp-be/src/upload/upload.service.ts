import {
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
  });

  constructor(private readonly configService: ConfigService) {}

  async uploadFile(fileName: string, fileBuffer: Buffer) {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow('AWS_BUCKET_NAME'),
        Key: fileName,
        Body: fileBuffer,
      }),
    );
  }

  async getSignedFileUrl(fileKey: string, expiresIn = 3600): Promise<string> {
    const params: GetObjectCommandInput = {
      Bucket: this.configService.getOrThrow('AWS_BUCKET_NAME'),
      Key: fileKey,
    };

    const command = new GetObjectCommand(params);
    return await getSignedUrl(this.s3Client, command, { expiresIn }); // URL expires in 1 hour
  }
}
