import { type Request, type Response } from 'express';
import { StorageProvider } from '@providers/StorageProvider';
import { prisma } from '../prisma.client';
import { AppError } from '@errors/AppError';

export class ChallengeController {
  private readonly storageProvider = new StorageProvider();

  public async create(request: Request, response: Response): Promise<void> {
    const { name, description, url, difficult, flags, releaseAt, showAt } =
      request.body;
    const image = request.file?.filename ?? '';

    try {
      const challenge = await prisma.challenge.create({
        data: {
          name,
          description,
          url,
          difficult,
          flags: {
            create: flags,
          },
          releaseAt,
          showAt,
        },
        include: {
          flags: true,
        },
      });

      if (image !== '') {
        await Promise.all([
          this.storageProvider.saveFile(image),
          prisma.challenge.update({
            where: { id: challenge.id },
            data: { image },
          }),
        ]);
      }

      response.status(201).json(challenge);
    } catch (error) {
      throw new AppError('Falha ao cadastrar o desafio', 500);
    }
  }
}
