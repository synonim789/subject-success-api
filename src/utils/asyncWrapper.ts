import { NextFunction, Request, Response } from 'express';

export const asyncWrapper =
   (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      return fn(req, res, next).catch(next);
   };
