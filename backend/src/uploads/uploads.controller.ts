import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('members/:memberId/photo')
  @Roles('ADMIN', 'SEGRETERIA')
  @UseInterceptors(FileInterceptor('photo', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
      // Accetta jpg, jpeg, png, webp
      if (file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed') as any, false);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadMemberPhoto(
    @Param('memberId') memberId: string,
    @UploadedFile()
    file: any,
  ) {
    console.log('🎯 Upload endpoint hit for member:', memberId);
    console.log('🎯 File received:', file ? 'yes' : 'no');
    if (file) {
      console.log('🎯 File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const photoUrl = await this.uploadsService.uploadMemberPhoto(memberId, file);
    console.log('🎯 Upload completed, photoUrl:', photoUrl);
    return { photoUrl };
  }

  @Delete('members/:memberId/photo')
  @Roles('ADMIN', 'SEGRETERIA')
  async deleteMemberPhoto(@Param('memberId') memberId: string) {
    await this.uploadsService.deleteMemberPhoto(memberId);
    return { message: 'Photo deleted successfully' };
  }
}
