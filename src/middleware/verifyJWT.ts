import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import env from '../utils/cleanEnv';

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
   const accessToken = req.cookies.accessToken;
   try {
      if (!accessToken) {
         throw createHttpError(401, 'Access Denied');
      }
      const decoded = jwt.verify(
         accessToken,
         env.ACCESS_TOKEN_SECRET,
         (err: unknown, decoded: any) => {
            req.user = decoded;
            next();
         },
      );
   } catch (error) {
      next(error);
   }
};
