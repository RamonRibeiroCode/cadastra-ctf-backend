import { type NextFunction, type Request, type Response } from 'express';
import { verify } from 'jsonwebtoken';

import { authConfig } from '@config/auth';
import { AppError } from '@errors/AppError';

interface IPayload {
  id: number;
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (authHeader === undefined || authHeader === '') {
    throw new AppError('Token não recebido', 401);
  }

  const { secret } = authConfig.options.jwt;

  const [, token] = authHeader.split(' ');

  try {
    const { id: userId } = verify(token, secret, {
      ignoreExpiration: false,
    }) as IPayload;

    request.user = {
      id: Number(userId),
    };

    next();
  } catch {
    throw new AppError('Token inválido', 401);
  }
}
