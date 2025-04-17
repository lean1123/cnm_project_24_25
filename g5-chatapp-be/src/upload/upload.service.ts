import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow('AWS_BUCKET_NAME'),
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    return this.getCloudFrontUrl(fileName);
  }

  getCloudFrontUrl(fileKey: string): string {
    const cloudFrontDomain =
      this.configService.getOrThrow<string>('AWS_CLOUDFRONT_URL');
    return `${cloudFrontDomain}/${fileKey}`;
  }
}
