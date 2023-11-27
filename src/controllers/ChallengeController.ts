import { type Request, type Response } from 'express';
import { StorageProvider } from '@providers/StorageProvider';
import { prisma } from '../prisma.client';
import { AppError } from '@errors/AppError';
import { DayjsDateProvider } from '@providers/DayJsProvider';

export class ChallengeController {
  private readonly storageProvider = new StorageProvider();
  private readonly dateProvider = new DayjsDateProvider();

  public async index(request: Request, response: Response): Promise<void> {
    const userId = request.user.id;

    const challenges = await prisma.challenge.findMany({
      include: {
        firstBlood: { select: { avatarUrl: true } },
        flags: { select: { points: true } },
        scoreboard: true,
      },
    });

    const challengesWithCompletedLabel = challenges.map((challenge) => ({
      ...challenge,
      wasCompletedByUser: challenge.scoreboard.some(
        (user) => user.userId === userId
      ),
      url: undefined,
    }));

    response.status(200).json(challengesWithCompletedLabel);
  }

  public async show(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const userId = request.user.id;

    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(id) },
      include: {
        scoreboard: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            executionTime: true,
          },
        },
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
            activities: {
              select: {
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
                flag: {
                  select: {
                    difficulty: true,
                    points: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new AppError('Desafio não encontrado', 404);
    }

    const wasCompletedByUser = challenge.scoreboard.some(
      (user) => user.user.id === userId
    );
    const challengeHasStarted = this.dateProvider.compareIfBefore(
      challenge.releaseAt,
      new Date()
    );

    response.status(200).json({
      ...challenge,
      wasCompletedByUser,
      url: challengeHasStarted ? challenge.url : undefined,
    });
  }

  public async delete(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    try {
      await prisma.challenge.delete({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      throw new AppError('Desafio não encontrado', 404);
    }

    response.status(200).send();
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
    const { flagName } = request.body;
    const { id } = request.params;
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError('Usuario não encontrado', 404);
    }

    const challenge = await prisma.challenge.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        scoreboard: true,
        flags: {
          include: {
            activities: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new AppError('Desafio não encontrado', 404);
    }

    const flags = challenge.flags;

    const flagMatch = flags.find((flag) => flag.flag === flagName);

    if (!flagMatch) {
      throw new AppError('Nome da flag incorreta', 404);
    }

    const alreadyRedeemed = flagMatch.activities.some(
      (activity) => activity.userId === userId
    );

    if (alreadyRedeemed) {
      throw new AppError('Você já resgatou essa flag', 400);
    }

    const howManyFlagsWereRedeemed = flags.reduce((accumulator, flag) => {
      const flagWasRedeemed = flag.activities.some(
        (activity) => activity.userId === userId
      );

      if (flagWasRedeemed) {
        return accumulator + 1;
      }

      return accumulator;
    }, 0);

    const isSubmitingLastFlag = flags.length === howManyFlagsWereRedeemed + 1;
    const isFirstBlood =
      challenge.scoreboard.length === 0 && isSubmitingLastFlag;

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

      const executionTime = this.dateProvider.compareInSeconds(
        new Date(),
        challenge.releaseAt
      );

      if (isSubmitingLastFlag) {
        await prisma.scoreboard.create({
          data: { userId, challengeId: Number(id), executionTime },
        });
      }

      await prisma.activity.create({
        data: { userId, flagId: flagMatch.id, executionTime },
      });

      let pointsToReedem = flagMatch.points;

      if (isFirstBlood) {
        const allFlagsPoints = flags.reduce((accumulator, flag) => {
          return accumulator + flag.points;
        }, 0);

        // First blood gets a 10% bonus
        const bonusPoints = allFlagsPoints * 0.1;

        pointsToReedem = pointsToReedem + bonusPoints;
      }

      await prisma.user.update({
        data: {
          points: user.points + pointsToReedem,
        },
        where: {
          id: userId,
        },
      });

      response.status(200).json({ message: 'Flag resgatada com sucesso' });
    } catch (error) {
      throw new AppError('Falha ao cadastrar o desafio', 500);
    }
  }
}
