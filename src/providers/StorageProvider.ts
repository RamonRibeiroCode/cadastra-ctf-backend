import fs from 'fs';
import path from 'path';

import { storageConfig } from '@config/storage';

export class StorageProvider {
  async saveFile(file: string): Promise<void> {
    const { temp, uploads } = storageConfig.folders;
    await fs.promises.rename(
      path.resolve(temp, file),
      path.resolve(uploads, file)
    );
  }

  async deleteFile(file: string): Promise<void> {
    if (file === '') return;
    const { uploads } = storageConfig.folders;
    const filePath = path.resolve(uploads, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}
