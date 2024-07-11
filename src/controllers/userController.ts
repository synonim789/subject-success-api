import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import OtpModel from '../models/Otp.model';
import UserModel from '../models/User.model';
import {
   ForgotPasswordSchema,
   ResetPasswordSchema,
   SetNewPasswordSchema,
   SingUpSchema,
   UpdateUsernameSchema,
} from '../schemas/user';
import env from '../utils/cleanEnv';
import { uploadImage } from '../utils/uploadImage';

export const signUp: RequestHandler = async (req, res) => {
   const {
      email,
      password: passwordRaw,
      username,
   } = SingUpSchema.parse(req.body);

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

export const getUser: RequestHandler = async (req, res) => {
   const userId = req.user._id;

   const user = await UserModel.findById(userId).select(
      '-password -googleId -githubId',
   );
   res.status(200).json(user);
};

export const forgotPassword: RequestHandler = async (req, res) => {
   const { email } = ForgotPasswordSchema.parse(req.body);

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

export const resetPassword: RequestHandler = async (req, res) => {
   const {
      otp,
      confirmPassword,
      password: passwordRaw,
   } = ResetPasswordSchema.parse(req.body);

   const otpExist = await OtpModel.findOne({ otp: otp }).exec();

   if (!otpExist) {
      throw createHttpError(400, 'Invalid OTP');
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

export const setNewPassword: RequestHandler = async (req, res) => {
   const { password: passwordRaw, confirmPassword: confirmPasswordRaw } =
      SetNewPasswordSchema.parse(req.body);

   const userId = req.user._id;

   if (passwordRaw !== confirmPasswordRaw) {
      throw createHttpError(400, 'Passwords do not match');
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

export const updateUsername: RequestHandler = async (req, res) => {
   const { username } = UpdateUsernameSchema.parse(req.body);
   const userId = req.user._id;

   const user = await UserModel.findById(userId);

   if (!user) {
      throw createHttpError(404, 'User not found');
   }

   user.username = username;
   await user.save();
   res.status(200).json({ message: 'Username updated successfully' });
};

export const updateProfilePicture: RequestHandler = async (req, res) => {
   const image = req.file;
   const userId = req.user._id;
   if (!image) {
      throw createHttpError(400, 'Image is required');
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
