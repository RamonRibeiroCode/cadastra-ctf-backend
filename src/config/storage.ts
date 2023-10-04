import crypto from 'crypto';
import { type Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import path from 'path';

import { AppError } from '@errors/AppError';

const destination = path.resolve(__dirname, '..', '..', 'temp');

interface IFile {
  originalname: string;
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];

export const storageConfig = {
  driver: process.env.STORAGE_DRIVER ?? 'disk',
  location: process.env.STORAGE_LOCATION ?? 'http://localhost:3333/files',

  folders: {
    temp: destination,
    uploads: path.resolve(destination, 'uploads'),
  },

  options: {
    multer: {
      storage: multer.diskStorage({
        destination,

        filename(request, file, callback) {
          const hash = crypto.randomBytes(8).toString('hex');
          const name = `m3ctf-${hash}-${file.originalname}`;

          callback(null, name);
        },
      }),

      limits: { fileSize: 2 * 1024 * 1024 },

      fileFilter(
        request: Request,
        file: IFile,
        callback: FileFilterCallback
      ): void {
        const { originalname } = file;
        const ext = path.extname(originalname);

        if (!imageExtensions.includes(ext)) {
          callback(new AppError('Formato de imagem inválido', 400));
        }

        if (originalname.includes('m3ctf')) {
          callback(null, false);
          return;
        }

        callback(null, true);
      },
    },
  },
};
