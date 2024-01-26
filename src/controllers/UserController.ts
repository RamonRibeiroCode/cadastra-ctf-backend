import { type Request, type Response } from 'express';
import { type $Enums, Prisma } from '@prisma/client';
import { prisma } from '../prisma.client';
import { S3StorageProvider } from '@providers/S3StorageProvider';
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
  private readonly storageProvider = new S3StorageProvider();

  public async index(_: Request, response: Response): Promise<void> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        avatarUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    response.status(200).json(users);
  }

  public async show(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new AppError('Desafio não encontrado', 404);
    }

    response.status(200).json(user);
  }

  public async update(request: Request, response: Response): Promise<void> {
    const userId = Number(request.params.id);

    const { name, email, points } = request.body;

    try {
      if (request.file) {
        const user = await prisma.user.findUnique({
          select: { avatar: true },
          where: { id: userId },
        });

        if (user?.avatar) {
          await this.storageProvider.delete(user?.avatar ?? '');
        }

        const avatarUrl = await this.storageProvider.upload(request.file);

        await prisma.user.update({
          where: { id: userId },
          data: { avatar: avatarUrl },
        });
      }

      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: { name, email, points },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          points: true,
        },
      });

      response.json(updateUser);
    } catch (error) {
      throw new AppError('Falha ao atualizar usuário', 500);
    }
  }

  public async create(request: Request, response: Response): Promise<void> {
    const { name, email, password, role } = request.body;
    const passwordHash = await this.hashProvider.generateHash(password);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          points: 0,
          role: role ?? 'USER',
          avatar: '',
        },
      });

      if (request.file) {
        const avatarUrl = await this.storageProvider.upload(request.file);

        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: avatarUrl },
        });
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

  public async delete(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    try {
      await prisma.user.delete({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      throw new AppError('Usuario não encontrado', 404);
    }

    response.status(200).send();
  }

  public async showProfile(
    request: Request,
    response: Response
  ): Promise<void> {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      select: {
        name: true,
        email: true,
        avatarUrl: true,
        points: true,
        avatar: true,
      },
      where: { id: userId },
    });

    if (user === null)
      response.status(404).json({ message: 'Usuário não encontrado' });

    response.json(user);
  }

  public async updateProfile(
    request: Request,
    response: Response
  ): Promise<void> {
    const userId = request.user.id;

    const { name } = request.body;

    try {
      if (request.file) {
        const user = await prisma.user.findUnique({
          select: { avatar: true },
          where: { id: userId },
        });

        if (user?.avatar) {
          await this.storageProvider.delete(user?.avatar ?? '');
        }

        const avatarUrl = await this.storageProvider.upload(request.file);

        await prisma.user.update({
          where: { id: userId },
          data: { avatar: avatarUrl },
        });
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
