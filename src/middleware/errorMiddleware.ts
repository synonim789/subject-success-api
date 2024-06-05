import { NextFunction, Request, Response } from 'express';
import { isHttpError } from 'http-errors';
import { ZodError } from 'zod';

const errorMiddleware = (
   error: unknown,
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   let errorMessage = 'an unknown error has occured';
   let statusCode = 500;
   if (isHttpError(error)) {
      statusCode = error.status;
      errorMessage = error.message;
   }

   if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      const uniqueMessages = [...new Set(errorMessages)];
      errorMessage = uniqueMessages.join(', ');
      statusCode = 400;
   }

   res.status(statusCode).json({ message: errorMessage });
};

export default errorMiddleware;
