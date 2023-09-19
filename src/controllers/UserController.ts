import { type Request, type Response } from 'express';
import { prisma } from '../prisma.client';

export class UserController {
  public async index(_: Request, response: Response): Promise<void> {
    const users = await prisma.user.findMany();

    response.status(200).json(users);
  }
}
