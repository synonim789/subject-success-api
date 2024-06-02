import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
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
         throw createHttpError(401, 'Access Denied');
      }
      const payload = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as any;
      const user = await UserModel.findById(payload.userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      req.user = payload;
      next();
   } catch (error) {
      next(error);
   }
};
