import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'photos');

  constructor(private prisma: PrismaService) {
    // Crea la cartella uploads/photos se non esiste
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadMemberPhoto(memberId: string, file: any): Promise<string> {
    console.log('📸 Upload foto iniziato per membro:', memberId);
    console.log('📁 File ricevuto:', file?.originalname, file?.mimetype, file?.size);
    console.log('📂 Upload path:', this.uploadPath);

    // Verifica che il membro esista
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      console.log('❌ Membro non trovato');
      throw new BadRequestException('Member not found');
    }

    // Genera nome file univoco
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedExtensions.includes(ext)) {
      console.log('❌ Estensione non valida:', ext);
      throw new BadRequestException('Invalid file type. Allowed: jpg, jpeg, png, webp');
    }

    const filename = `${memberId}${ext}`;
    const filePath = path.join(this.uploadPath, filename);
    console.log('📝 Salvataggio file in:', filePath);

    // Elimina vecchia foto se esiste
    if (member.photoUrl) {
      const oldFilePath = path.join(process.cwd(), member.photoUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log('🗑️ Vecchia foto eliminata');
      }
    }

    // Salva il nuovo file
    fs.writeFileSync(filePath, file.buffer);
    console.log('✅ File salvato con successo');

    // Aggiorna il database con il percorso relativo
    const photoUrl = `/uploads/photos/${filename}`;
    await this.prisma.member.update({
      where: { id: memberId },
      data: { photoUrl },
    });
    console.log('✅ Database aggiornato con photoUrl:', photoUrl);

    return photoUrl;
  }

  async deleteMemberPhoto(memberId: string): Promise<void> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    if (member.photoUrl) {
      const filePath = path.join(process.cwd(), member.photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await this.prisma.member.update({
        where: { id: memberId },
        data: { photoUrl: null },
      });
    }
  }
}
