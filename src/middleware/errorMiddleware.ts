import { NextFunction, Request, Response } from 'express';
import { isHttpError } from 'http-errors';
import { ZodError } from 'zod';

const errorMiddleware = (
   error: unknown,
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   console.log(error);
   let errorMessage = 'unknown error has occurred';
   let statusCode = 500;
   if (isHttpError(error)) {
      statusCode = error.status;
      errorMessage = error.message;
   }

   if (error instanceof ZodError) {
      statusCode = 400;
      errorMessage = error.issues.toString();
   }

   res.status(statusCode).json({ message: errorMessage });
};

export default errorMiddleware;
