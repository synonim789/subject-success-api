import { z } from 'zod';

export const LoginSchema = z.object({
   email: z.string().email('Invalid Email'),
   password: z.string().min(1, { message: 'Passowrd must be provided' }),
});

export const GoogleAuthSchema = z.object({
   code: z.string(),
});

export const GithubAuthSchema = z.object({
   code: z.string(),
   path: z.string(),
});
