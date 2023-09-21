export const authConfig = {
  options: {
    jwt: {
      secret: process.env.JWT_SECRET ?? 'm3ctf',
      expiration: process.env.JWT_EXPIRATION ?? '5d',
    },
  },
};
