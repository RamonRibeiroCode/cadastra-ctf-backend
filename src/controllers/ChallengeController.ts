import { type Request, type Response } from 'express';
import { prisma } from '../prisma.client';
import { AppError } from '@errors/AppError';
import { DayjsDateProvider } from '@providers/DayJsProvider';
import { S3StorageProvider } from '@providers/S3StorageProvider';
import { type Flag } from '@prisma/client';

export class ChallengeController {
  private readonly dateProvider = new DayjsDateProvider();
  private readonly storageProvider = new S3StorageProvider();

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
          orderBy: {
            executionTime: 'asc',
          },
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

  public async create(request: Request, response: Response): Promise<void> {
    const { name, description, url, difficulty, flags, releaseAt } =
      request.body;

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

      if (request.file) {
        const imageUrl = await this.storageProvider.upload(request.file);

        const updatedChallenge = await prisma.challenge.update({
          where: { id: challenge.id },
          data: { image: imageUrl },
          include: {
            flags: true,
          },
        });

        challenge = updatedChallenge;
      }

      response.status(201).json(challenge);
    } catch (error) {
      throw new AppError('Falha ao cadastrar o desafio', 500);
    }
  }

  public async update(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    const {
      name,
      description,
      url,
      difficulty,
      flags,
      releaseAt,
      flagWasEdited,
    } = request.body;

    const parsedFlags: Flag[] = JSON.parse(flags);

    try {
      // TODO: VALIDATE DUPLICATED FLAGS NAMES
      let challenge = await prisma.challenge.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          description,
          url,
          difficulty,
          releaseAt,
        },
      });

      if (request.file) {
        const imageUrl = await this.storageProvider.upload(request.file);

        const fileUpdatedChallenge = await prisma.challenge.update({
          where: { id: challenge.id },
          data: { image: imageUrl },
        });

        challenge = fileUpdatedChallenge;
      }

      if (flagWasEdited) {
        await prisma.flag.deleteMany({
          where: { challengeId: Number(id) },
        });

        await prisma.flag.createMany({
          data: parsedFlags.map((parsedFlag) => ({
            ...parsedFlag,
            challengeId: Number(id),
          })),
        });
      }

      response.status(201).json(challenge);
    } catch (error) {
      throw new AppError('Falha ao atualizar o desafio', 500);
    }
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

    const isSecondPlace =
      challenge.scoreboard.length === 1 && isSubmitingLastFlag;

    const isThirdPlace =
      challenge.scoreboard.length === 2 && isSubmitingLastFlag;

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

      const allFlagsPoints = flags.reduce((accumulator, flag) => {
        return accumulator + flag.points;
      }, 0);

      if (isFirstBlood) {
        // First blood gets a 100% bonus
        const bonusPoints = allFlagsPoints;

        pointsToReedem = pointsToReedem + bonusPoints;
      }

      if (isSecondPlace) {
        // SecondPlace gets a 50% bonus
        const bonusPoints = allFlagsPoints * 0.5;

        pointsToReedem = pointsToReedem + bonusPoints;
      }

      if (isThirdPlace) {
        // ThirdPlace gets a 20% bonus
        const bonusPoints = allFlagsPoints * 0.2;

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
      throw new AppError('Erro ao resgatar flag', 500);
    }
  }

  public async adminIndex(request: Request, response: Response): Promise<void> {
    const challenges = await prisma.challenge.findMany({
      include: {
        flags: true,
      },
    });

    response.status(200).json(challenges);
  }

  public async adminShow(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(id) },
      include: {
        flags: true,
      },
    });

    if (!challenge) {
      throw new AppError('Desafio não encontrado', 404);
    }

    response.status(200).json(challenge);
  }
}
