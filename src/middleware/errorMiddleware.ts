import { NextFunction, Request, Response } from 'express';
import { isHttpError } from 'http-errors';
import { ZodError } from 'zod';

const errorMiddleware = (
   error: unknown,
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   let errorMessage: string;
   let statusCode: number;
   console.log(error);
   if (isHttpError(error)) {
      statusCode = error.status;
      errorMessage = error.message;
   } else if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      const uniqueMessages = [...new Set(errorMessages)];
      errorMessage = uniqueMessages.join(', ');
      statusCode = 400;
   } else {
      errorMessage = 'an unknown error has occured';
      statusCode = 500;
      console.log(error);
   }
   res.status(statusCode).json({ message: errorMessage });
};

export default errorMiddleware;
