import { type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.client';
import { StorageProvider } from '@providers/StorageProvider';
import { HashProvider } from '@providers/HashProvider';
import { AppError } from '@errors/AppError';

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
    const maxPoints = allFlagPoints * 1.1;

    const scoreboard = usersScore.map((userScore) => ({
      ...userScore,
      firstBloods: userScore.firstBloods.length,
    }));

    response.status(200).json({ scoreboard, maxPoints });
  }
}
