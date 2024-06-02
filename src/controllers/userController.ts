import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import OtpModel from '../models/Otp.model';
import UserModel from '../models/User.model';
import env from '../utils/cleanEnv';
import { uploadImage } from '../utils/uploadImage';

interface SignUpBody {
   username?: string;
   email?: string;
   password?: string;
}

export const signUp: RequestHandler<
   unknown,
   unknown,
   SignUpBody,
   unknown
> = async (req, res, next) => {
   const username = req.body.username;
   const email = req.body.email;
   const passwordRaw = req.body.password;
   if (!username || !email || !passwordRaw) {
      throw createHttpError(400, 'All fields must be filled');
   }

   const emailRegex = new RegExp(
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
   );

   if (!emailRegex.test(email)) {
      throw createHttpError(400, 'Not valid Email');
   }

   const passwordRegex = new RegExp(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
   );

   if (!passwordRegex.test(passwordRaw)) {
      throw createHttpError(400, 'Password not strong enough.');
   }

   const existingUsername = await UserModel.findOne({
      username: username,
   }).exec();

   if (existingUsername) {
      throw createHttpError(409, 'Username already taken');
   }

   const existingEmail = await UserModel.findOne({ email: email }).exec();

   if (existingEmail) {
      throw createHttpError(409, 'Email already taken');
   }

   const password = await bcrypt.hash(passwordRaw, 10);

   const user = await UserModel.create({
      username: username,
      email: email,
      password: password,
   });

   res.status(201).json({
      message: `${user.username} created! Welcome now you have to log in`,
   });
};

export const getUser: RequestHandler = async (req, res, next) => {
   const userId = req.user?.userId;
   if (!userId) {
      throw createHttpError(400, 'No UserId in token');
   }

   const user = await UserModel.findById(userId).select(
      '-password -googleId -githubId',
   );
   if (!user) {
      throw createHttpError(404, 'User not found');
   }
   res.status(200).json(user);
};

interface ForgotPasswordBody {
   email?: string;
}

export const forgotPassword: RequestHandler<
   unknown,
   unknown,
   ForgotPasswordBody,
   unknown
> = async (req, res, next) => {
   const email = req.body.email;
   if (!email) {
      throw createHttpError(401, 'Email was not provided');
   }

   const user = await UserModel.findOne({ email: email }).exec();

   if (!user) {
      throw createHttpError(404, 'User not found');
   }

   if (user?.githubId || user?.googleId) {
      throw createHttpError(
         403,
         "Your account was registered by google or github you can't reset these passwords",
      );
   }

   const generateOtp = Math.floor(Math.random() * 9000) + 1000;

   const otpExist = await OtpModel.findOne({ email: email }).exec();
   if (otpExist) {
      throw createHttpError(400, 'Otp for this email already exist');
   }

   await OtpModel.create({ email: email, otp: generateOtp });

   const transport = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
         user: env.MAILTRAP_USER,
         pass: env.MAILTRAP_PASSWORD,
      },
   });

   await transport.sendMail({
      from: 'subject-success@gmail.com',
      to: email,
      subject: 'Password Reset',
      html: `<b>${generateOtp}</b>`,
   });

   res.status(200).json({ message: 'Email sent' });
};

interface ResetPasswordBody {
   otp?: number;
   password?: string;
   confirmPassword?: string;
}

export const resetPassword: RequestHandler<
   unknown,
   unknown,
   ResetPasswordBody,
   unknown
> = async (req, res, next) => {
   const otp = req.body.otp;
   const passwordRaw = req.body.password;
   const confirmPassword = req.body.confirmPassword;
   if (!otp) {
      throw createHttpError(400, 'OTP Required');
   }

   const otpExist = await OtpModel.findOne({ otp: otp }).exec();

   if (!otpExist) {
      throw createHttpError(400, 'Invalid OTP');
   }

   if (!passwordRaw || !confirmPassword) {
      throw createHttpError(400, 'password and confirm password are required');
   }

   if (passwordRaw !== confirmPassword) {
      throw createHttpError(400, 'Passwords do not match');
   }

   const password = await bcrypt.hash(passwordRaw, 10);

   const email = otpExist.email;

   const user = await UserModel.findOne({ email: email }).exec();
   if (!user) {
      throw createHttpError(404, 'User not found');
   }

   user.password = password;
   await user.save();

   res.status(200).json({ message: 'Password updated successfully' });
};

interface SetNewPasswordBody {
   password?: string;
   confirmPassword?: string;
}

export const setNewPassword: RequestHandler<
   unknown,
   unknown,
   SetNewPasswordBody,
   unknown
> = async (req, res, next) => {
   const confirmPasswordRaw = req.body.confirmPassword;
   const passwordRaw = req.body.password;
   const userId = req.user?.userId;
   if (!passwordRaw || !confirmPasswordRaw) {
      throw createHttpError(400, 'password and confirm password are required');
   }

   if (passwordRaw !== confirmPasswordRaw) {
      throw createHttpError(400, 'Passwords do not match');
   }

   if (!userId) {
      throw createHttpError(400, 'Token not provided');
   }

   const user = await UserModel.findById(userId);

   if (!user) {
      throw createHttpError(404, 'User not found');
   }

   const hashedPassword = await bcrypt.hash(passwordRaw, 10);
   user.password = hashedPassword;
   await user.save();

   res.status(200).json({ message: 'Password updated successfully' });
};

interface UpdateUsernameBody {
   username?: string;
}

export const updateUsername: RequestHandler<
   unknown,
   unknown,
   UpdateUsernameBody,
   unknown
> = async (req, res, next) => {
   const username = req.body.username;
   const userId = req.user?.userId;
   if (!username) {
      throw createHttpError(400, 'Username is required');
   }

   if (!userId) {
      throw createHttpError(400, 'Invalid token');
   }

   const user = await UserModel.findById(userId);

   if (!user) {
      throw createHttpError(404, 'User not found');
   }

   user.username = username;
   await user.save();
   res.status(200).json({ message: 'Username updated successfully' });
};

export const updateProfilePicture: RequestHandler = async (req, res, next) => {
   const image = req.file;
   const userId = req.user?.userId;
   if (!image) {
      throw createHttpError(400, 'Image is required');
   }

   if (!userId) {
      throw createHttpError(400, 'Invalid token');
   }

   const user = await UserModel.findById(userId);

   if (!user) {
      throw createHttpError(404, 'User not found');
   }

   const imageUrl = await uploadImage(image);

   user.picture = imageUrl;
   user.save();

   res.status(200).json({ message: 'Image uploaded' });
};
