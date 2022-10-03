import { HttpException } from '../../models/errors';
import { NextFunction, Request, Response } from 'express';


export const errorHandler = (err: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
  console.log('Error handling middleware called.');
  console.log('Path:', req.path);
  console.error('Error occurred:', err);
  if (err instanceof HttpException) {
    console.log('Error is known.');
    res.status(err.status).send(err)
  } else {
    // For unhandled errors.
    res.status(500).send({ code: 400, status: 500 });
  }
}
