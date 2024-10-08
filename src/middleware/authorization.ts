import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel from '../models/User.model';
import env from '../utils/cleanEnv';

export const authorization = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   const accessToken = req.cookies.accessToken;
   try {
      if (!accessToken) {
         throw createHttpError(403, 'Access Denied');
      }
      const payload = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as any;
      if (!payload.userId) {
         throw createHttpError(400, 'Invalid token');
      }

      if (!mongoose.isValidObjectId(payload.userId)) {
         throw createHttpError(400, 'Invalid user Id');
      }

      const user = await UserModel.findById(payload.userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      req.user = {
         _id: user._id.toString(),
         username: user.username,
         password: user.password,
         githubId: user?.githubId,
         googleId: user?.googleId,
         picture: user.picture,
      };
      next();
   } catch (error) {
      next(error);
   }
};
