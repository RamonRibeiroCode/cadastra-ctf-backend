import { type Request, type Response } from 'express';
import { StorageProvider } from '@providers/StorageProvider';
import { prisma } from '../prisma.client';
import { AppError } from '@errors/AppError';

export class ChallengeController {
  private readonly storageProvider = new StorageProvider();

  public async index(_: Request, response: Response): Promise<void> {
    const challenges = await prisma.challenge.findMany({
      include: {
        firstBlood: { select: { avatarUrl: true } },
        flags: { select: { points: true } },
      },
    });

    response.status(200).json(challenges);
  }

  public async show(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id: Number(id) },
        include: {
          users: true,
          firstBlood: {
            select: {
              avatarUrl: true,
              name: true,
            },
          },
          flags: {
            select: {
              points: true,
              difficulty: true,
              activities: true,
            },
          },
        },
      });

      response.status(201).json(challenge);
    } catch (error) {
      throw new AppError('Desafio não encontrado', 404);
    }
  }

  public async create(request: Request, response: Response): Promise<void> {
    const { name, description, url, difficulty, flags, releaseAt } =
      request.body;
    const image = request.file?.filename ?? '';

    try {
      // TODO: VALIDATE DUPLICATED FLAGS NAMES

      let challenge = await prisma.challenge.create({
        data: {
          name,
          description,
          url,
          difficulty,
          flags: {
            createMany: {
              data: JSON.parse(flags),
            },
          },
          releaseAt,
        },
        include: {
          flags: true,
        },
      });

      if (image !== '') {
        const [, updatedChallenge] = await Promise.all([
          this.storageProvider.saveFile(image),
          prisma.challenge.update({
            where: { id: challenge.id },
            data: { image },
            include: {
              flags: true,
            },
          }),
        ]);

        challenge = updatedChallenge;
      }

      response.status(201).json(challenge);
    } catch (error) {
      throw new AppError('Falha ao cadastrar o desafio', 500);
    }
  }

  public async submitFlag(request: Request, response: Response): Promise<void> {
    // TODO: VALIDATE FLAG NAME
    // const { flagName } = request.body;
    const { id } = request.params;

    // TODO: VALIDATE FIRST BLOOD
    const isFirstBlood = true;

    const userId = request.user.id;

    try {
      if (isFirstBlood) {
        await prisma.challenge.update({
          data: {
            firstBloodUserId: userId,
          },
          where: {
            id: Number(id),
          },
        });
      }

      // TODO: ADD IN ACTIVITY

      // TODO: ADD IN SCOREBOARD IF ALL FLAGS WERE CAPTURED

      response.status(201).json({});
    } catch (error) {
      throw new AppError('Falha ao cadastrar o desafio', 500);
    }
  }
}
