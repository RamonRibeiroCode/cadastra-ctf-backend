import { type Request, type Response } from 'express';
import { sign } from 'jsonwebtoken';

import { authConfig } from '@config/auth';
import { AppError } from '@errors/AppError';
import { prisma } from '../prisma.client';
import { HashProvider } from '@providers/HashProvider';

export class AuthController {
  private readonly hashProvider = new HashProvider();

  public async login(request: Request, response: Response): Promise<void> {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
        points: true,
        avatar: true,
      },
      where: { email },
    });

    if (user === null) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const passwordMatch = await this.hashProvider.compareHash(
      password,
      user.password
    );

    if (!passwordMatch) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const { secret, expiration } = authConfig.options.jwt;

    const formatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      points: user.points,
    };

    const token = sign(formatedUser, secret, {
      algorithm: 'RS256',
      expiresIn: expiration,
    });

    response.json({ user: formatedUser, token });
  }
}
