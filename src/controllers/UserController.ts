import { type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.client';
import { GenerateHashService } from '@services/GenerateHashService';
import { StorageProvider } from '@providers/StorageProvider';
import { AppError } from '@errors/AppError';

export class UserController {
  private readonly generateHashService = new GenerateHashService();
  private readonly storageProvider = new StorageProvider();

  public async index(_: Request, response: Response): Promise<void> {
    const users = await prisma.user.findMany();
    response.status(200).json(users);
  }

  public async register(request: Request, response: Response): Promise<void> {
    const { name, email, password } = request.body;
    const avatar = request.file?.filename ?? '';
    const passwordHash = await this.generateHashService.execute(password);

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
        throw new AppError('Usuário já cadastrado.', 400);
      } else {
        throw new AppError('Falha ao salvar avatar.', 500);
      }
    }

    response.status(201).json({ message: 'Usuário registrado com sucesso!' });
  }
}
