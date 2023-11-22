import { z } from 'zod';

const flagObject = z.object({
  flag: z
    .string({
      required_error: 'O campo flag é obrigatório.',
    })
    .trim()
    .min(1, 'O campo nome é obrigatório.'),
  points: z
    .number({
      required_error: 'O campo points é obrigatório.',
    })
    .min(1, 'O campo points é obrigatório.'),

  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'INSANE']),
});

export const challengeSchema = {
  create: z.object({
    body: z.object({
      name: z
        .string({
          required_error: 'O campo challenge é obrigatório.',
        })
        .trim()
        .min(1, 'O campo nome é obrigatório.'),
      description: z
        .string({
          required_error: 'O campo description é obrigatório.',
        })
        .trim()
        .min(1, 'O campo description é obrigatório.'),
      url: z
        .string({
          required_error: 'O campo url é obrigatório.',
        })
        .trim()
        .min(1, 'O campo url é obrigatório.'),
      difficulty: z
        .string({
          required_error: 'O campo difficulty é obrigatório.',
        })
        .trim()
        .min(1, 'O campo difficulty é obrigatório.'),
      releaseAt: z
        .string({
          required_error: 'O campo releaseAt é obrigatório.',
        })
        .trim()
        .min(1, 'O campo releaseAt é obrigatório.'),
      flags: z.preprocess(
        (flags) => JSON.parse(flags as string),
        z.array(flagObject)
      ),
    }),
  }),
};
