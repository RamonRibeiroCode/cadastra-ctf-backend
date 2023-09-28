import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
  result: {
    user: {
      avatarUrl: {
        needs: { avatar: true },
        compute(user) {
          return `http://localhost:3333/files/${user.avatar}`;
        },
      },
    },
  },
});
