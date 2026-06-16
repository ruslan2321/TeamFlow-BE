import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const isServerless =
  process.env.VERCEL === '1' || process.cwd().startsWith('/var/task');

const uploadsRoot = isServerless
  ? join('/tmp', 'uploads')
  : join(process.cwd(), 'uploads');

export const UPLOADS_DIR = uploadsRoot;
export const AVATARS_DIR = join(UPLOADS_DIR, 'avatars');

export function ensureUploadDirs(): void {
  if (!existsSync(AVATARS_DIR)) {
    mkdirSync(AVATARS_DIR, { recursive: true });
  }
}

ensureUploadDirs();

export function toAvatarUrl(filename?: string | null): string | null {
  if (!filename) return null;
  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('/')
  ) {
    return filename;
  }
  return `/uploads/avatars/${filename}`;
}

export function avatarStorageFileName(filename?: string | null): string | null {
  if (!filename) return null;
  const parts = filename.split('/');
  return parts[parts.length - 1] || null;
}

export const avatarUploadOptions = {
  storage: diskStorage({
    destination: AVATARS_DIR,
    filename: (_req: unknown, file: Express.Multer.File, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException('Разрешены только JPG, PNG и WEBP'),
        false,
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
