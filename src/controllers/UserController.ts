import { type Request, type Response } from 'express';
import { prisma } from '../prisma.client';
import { GenerateHashService } from '@services/GenerateHashService';
import { AppError } from '@errors/AppError';

export class UserController {
  private readonly generateHashService = new GenerateHashService();

  public async index(_: Request, response: Response): Promise<void> {
    const users = await prisma.user.findMany();
    response.status(200).json(users);
  }

  public async register(request: Request, response: Response): Promise<void> {
    const { name, email, password } = request.body;
    const passwordHash = await this.generateHashService.execute(password);

    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          points: 0,
          role: 'USER',
          avatar: '',
        },
      });
    } catch (error) {
      throw new AppError('Usuário já cadastrado.', 400);
    }

    response.status(201).json({ message: 'Usuário registrado com sucesso!' });
  }
}
