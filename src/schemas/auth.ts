import { z } from 'zod';

export const LoginSchema = z.object({
   email: z
      .string({ message: 'Please provide both email and password to proceed' })
      .email(),
   password: z.string({
      message: 'Please provide both email and password to proceed',
   }),
});

export const GoogleAuthSchema = z.object({
   code: z.string(),
});

export const GithubAuthSchema = z.object({
   code: z.string(),
   path: z.string(),
});
