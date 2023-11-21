import { z } from 'zod';

export const challengeSchema = {
  create: z.object({
    body: z.object({
      name: z
        .string({
          required_error: 'O campo nome é obrigatório.',
        })
        .trim()
        .min(1, 'O campo nome é obrigatório.'),
      email: z
        .string({
          required_error: 'O campo e-mail é obrigatório',
        })
        .trim()
        .min(1, 'O campo nome é obrigatório.')
        .email('Formato inválido para e-mail'),
      password: z
        .string({
          required_error: 'O campo senha é obrigatório',
        })
        .trim()
        .min(6, 'A senha precisa ter no mínimo 6 caracteres.'),
    }),
  }),
  update: z.object({
    body: z.object({
      name: z
        .string({
          required_error: 'O campo nome é obrigatório.',
        })
        .trim()
        .min(1, 'O campo nome é obrigatório.'),
    }),
  }),
};
