import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
  result: {
    user: {
      avatarUrl: {
        needs: { avatar: true },
        compute(user) {
          return user.avatar !== null && user.avatar !== ''
            ? `${
                process.env.STORAGE_LOCATION ?? 'http://localhost:3333/files'
              }/${user.avatar}`
            : null;
        },
      },
    },
    challenge: {
      imageUrl: {
        needs: { image: true },
        compute(challenge) {
          return challenge.image !== null && challenge.image !== ''
            ? `${
                process.env.STORAGE_LOCATION ?? 'http://localhost:3333/files'
              }/${challenge.image}`
            : null;
        },
      },
    },
  },
});
