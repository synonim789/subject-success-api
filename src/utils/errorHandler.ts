import { NextFunction, Request, Response } from 'express'
import { isHttpError } from 'http-errors'

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error)
  let errorMessage = 'unknown error has occurred'
  let statusCode = 500
  if (isHttpError(error)) {
    statusCode = error.status
    errorMessage = error.message
  }
  res.status(statusCode).json({ message: errorMessage })
}

export default errorHandler
