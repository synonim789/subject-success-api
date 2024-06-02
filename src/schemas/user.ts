import { z } from 'zod';

const passwordValidation = new RegExp(
   /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
);

export const SingUpSchema = z.object({
   username: z.string(),
   email: z.string().email(),
   password: z
      .string()
      .regex(passwordValidation, { message: 'Password not strong enough' }),
});

export const ForgotPasswordSchema = z.object({
   email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
   otp: z.number().int(),
   password: z
      .string()
      .regex(passwordValidation, { message: 'Password not strong enough' }),
   confirmPassword: z
      .string()
      .regex(passwordValidation, { message: 'Password not strong enough' }),
});

export const SetNewPasswordSchema = z.object({
   password: z.string().regex(passwordValidation),
   confirmPassword: z.string().regex(passwordValidation),
});

export const UpdateUsernameSchema = z.object({
   username: z.string(),
});
