import { z } from 'zod';

const passwordValidation = new RegExp(
   /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
);

export const SingUpSchema = z.object({
   username: z.string({ message: 'All fields must be filled' }),
   email: z
      .string({ message: 'All fields must be filled' })
      .email({ message: 'Not valid Email' }),
   password: z
      .string({ message: 'All fields must be filled' })
      .regex(passwordValidation, { message: 'Password not strong enough.' }),
});

export const ForgotPasswordSchema = z.object({
   email: z.string({ message: 'Email was not provided' }).email(),
});

export const ResetPasswordSchema = z.object({
   otp: z.number({ message: 'OTP Required' }).int(),
   password: z
      .string({ message: 'All fields must be filled' })
      .regex(passwordValidation, { message: 'Password not strong enough' }),
   confirmPassword: z
      .string({ message: 'All fields must be filled' })
      .regex(passwordValidation, { message: 'Password not strong enough' }),
});

export const SetNewPasswordSchema = z.object({
   password: z
      .string({ message: 'password and confirm password are required' })
      .regex(passwordValidation, { message: 'Password not strong enough' }),
   confirmPassword: z
      .string({ message: 'password and confirm password are required' })
      .regex(passwordValidation, { message: 'Password not strong enough' }),
});

export const UpdateUsernameSchema = z.object({
   username: z.string({ message: 'Username is required' }),
});
