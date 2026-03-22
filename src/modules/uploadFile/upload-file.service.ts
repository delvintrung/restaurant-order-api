import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import cloudinary from '../../../src/config/cloudinary.js';

@Injectable()
export class UploadFileService {
  async uploadImage(file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.buffer) {
      throw new BadRequestException('Invalid file buffer');
    }

    try {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'restaurant-order',
        resource_type: 'image',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Upload to Cloudinary failed: ${error?.message ?? 'Unknown error'}`,
      );
    }
  }
}
