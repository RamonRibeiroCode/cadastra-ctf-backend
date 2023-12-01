import { type Request, type Response } from 'express';
import { type $Enums, Prisma } from '@prisma/client';
import { prisma } from '../prisma.client';
import { StorageProvider } from '@providers/StorageProvider';
import { HashProvider } from '@providers/HashProvider';
import { AppError } from '@errors/AppError';

type Activity = {
  user: {
    name: string;
    avatarUrl: string | null;
    points: number;
  };
  flag: {
    challenge: {
      name: string;
    };
    points: number;
    difficulty: $Enums.Difficulty;
  };
} & {
  createdAt: Date;
  userId: number;
  flagId: number;
  executionTime: number;
};

export class UserController {
  private readonly hashProvider = new HashProvider();
  private readonly storageProvider = new StorageProvider();

  public async register(request: Request, response: Response): Promise<void> {
    const { name, email, password } = request.body;
    const avatar = request.file?.filename ?? '';
    const passwordHash = await this.hashProvider.generateHash(password);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          points: 0,
          role: 'USER',
          avatar: '',
        },
      });

      if (avatar !== '') {
        await Promise.all([
          this.storageProvider.saveFile(avatar),
          prisma.user.update({ where: { id: user.id }, data: { avatar } }),
        ]);
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Usuário já cadastrado', 400);
      } else {
        throw new AppError('Falha ao salvar avatar', 500);
      }
    }

    response.status(201).json({ message: 'Usuário registrado com sucesso' });
  }

  public async update(request: Request, response: Response): Promise<void> {
    const userId = request.user.id;

    const { name } = request.body;
    const avatar = request.file?.filename ?? '';

    try {
      if (avatar !== '') {
        const user = await prisma.user.findUnique({
          select: { avatar: true },
          where: { id: userId },
        });

        await Promise.all([
          this.storageProvider.deleteFile(user?.avatar ?? ''),
          this.storageProvider.saveFile(avatar),
          prisma.user.update({ where: { id: userId }, data: { avatar } }),
        ]);
      }

      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
        select: { name: true, email: true, avatarUrl: true, points: true },
      });

      response.json(updateUser);
    } catch (error) {
      throw new AppError('Falha ao atualizar usuário', 500);
    }
  }

  public async showProfile(
    request: Request,
    response: Response
  ): Promise<void> {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      select: { name: true, email: true, avatarUrl: true, points: true },
      where: { id: userId },
    });

    if (user === null)
      response.status(404).json({ message: 'Usuário não encontrado' });

    response.json(user);
  }

  public async scoreboard(_: Request, response: Response): Promise<void> {
    const usersScore = await prisma.user.findMany({
      select: {
        name: true,
        points: true,
        avatarUrl: true,
        firstBloods: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
    });

    const allFlags = await prisma.flag.findMany();
    const allFlagPoints = allFlags.reduce((accumulator, flag) => {
      return accumulator + flag.points;
    }, 0);
    const maxPoints = Math.round(allFlagPoints * 1.1);

    const scoreboard = usersScore.map((userScore) => ({
      ...userScore,
      firstBloods: userScore.firstBloods.length,
    }));

    response.status(200).json({ scoreboard, maxPoints });
  }

  public async maxPoints(_: Request, response: Response): Promise<void> {
    const allFlags = await prisma.flag.findMany();
    const allFlagPoints = allFlags.reduce((accumulator, flag) => {
      return accumulator + flag.points;
    }, 0);
    const maxPoints = Math.round(allFlagPoints * 1.1);

    response.status(200).json({ maxPoints });
  }

  public async activities(_: Request, response: Response): Promise<void> {
    const flags = await prisma.flag.findMany({
      include: {
        activities: {
          include: {
            flag: {
              select: {
                points: true,
                difficulty: true,
                challenge: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            user: {
              select: {
                avatarUrl: true,
                name: true,
                points: true,
              },
            },
          },
        },
      },
    });

    const flagsActivities: Activity[] = [];

    flags.forEach((flag) => flagsActivities.push(...flag.activities));

    flagsActivities.sort((activityA, activityB) => {
      const activityADate = new Date(activityA.createdAt);
      const activityBDate = new Date(activityB.createdAt);

      return Number(activityBDate) - Number(activityADate);
    });

    response.status(200).json({ activities: flagsActivities });
  }
}
