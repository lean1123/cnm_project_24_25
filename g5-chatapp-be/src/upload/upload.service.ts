import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from './ffmpegModule';
import * as tmp from 'tmp-promise';
import * as fs from 'fs';

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
    if (contentType === 'audio/webm' || contentType === 'video/webm') {
      const { outputBuffer, outputName } = await this.convertWebmToMp3(
        fileBuffer,
        fileName,
      );
      fileName = outputName;
      fileBuffer = outputBuffer;
      contentType = 'audio/mpeg';
    }
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

  private async convertWebmToMp3(
    buffer: Buffer,
    originalName: string,
  ): Promise<{ outputBuffer: Buffer; outputName: string }> {
    const inputFile = await tmp.file({ postfix: '.webm' });
    const outputFile = await tmp.file({ postfix: '.mp3' });

    await fs.promises.writeFile(inputFile.path, buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(inputFile.path)
        .toFormat('mp3')
        .save(outputFile.path)
        .on('end', () => {
          fs.promises
            .readFile(outputFile.path)
            .then((outputBuffer) => {
              const outputName = originalName.replace(/\.webm$/, '.mp3');
              resolve({ outputBuffer, outputName });
            })
            .catch(reject);
        })
        .on('error', (err) => {
          Promise.all([inputFile.cleanup(), outputFile.cleanup()])
            .then(() => reject(err))
            .catch(() => reject(err)); // vẫn reject nếu cleanup lỗi
        });
    });
  }
}
