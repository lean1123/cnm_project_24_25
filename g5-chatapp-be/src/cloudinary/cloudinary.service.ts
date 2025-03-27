import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary.response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
  ): Promise<{ fileName: string; url: string }> {
    return new Promise<{ fileName: string; url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error: unknown, result: CloudinaryResponse | undefined) => {
          if (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            return reject(err);
          }

          if (!result || !result.secure_url) {
            return reject(new Error('Upload failed, no secure URL returned.'));
          }

          resolve({
            fileName: file.originalname,
            url: result.secure_url,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
