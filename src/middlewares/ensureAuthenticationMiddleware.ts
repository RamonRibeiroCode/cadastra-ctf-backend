import { type NextFunction, type Request, type Response } from 'express';
import { verify } from 'jsonwebtoken';

import { authConfig } from '@config/auth';
import { AppError } from '@errors/AppError';

interface IPayload {
  sub: string;
}

export interface RequestWithUser extends Request {
  user: {
    id: number;
  };
}

export async function ensureAuthenticated(
  request: RequestWithUser,
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
    const { sub: userId } = verify(token, secret, {
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
