export const authConfig = {
  options: {
    jwt: {
      secret: process.env.JWT_SECRET ?? 'cadastractf',
      expiration: process.env.JWT_EXPIRATION ?? '5d',
    },
  },
};
