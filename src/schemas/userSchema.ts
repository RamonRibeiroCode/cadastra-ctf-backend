import { z } from 'zod';

export const userSchema = {
  register: z.object({
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
          required_error: 'O campo password é obrigatório',
        })
        .trim(),
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
  updatePassword: z.object({
    body: z.object({
      password: z
        .string({
          required_error: 'O campo password é obrigatório.',
        })
        .trim()
        .min(1, 'O campo password é obrigatório.'),
    }),
  }),
};
