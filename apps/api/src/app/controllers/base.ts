import { NextFunction, Request } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { isArray, validate } from 'class-validator';
import { Code, HttpException } from '../../models';

export class Controller {
  public async validateRequestBody<T extends Record<string, any>>(cls: ClassConstructor<T>, req: Request): Promise<T> {
    if (isArray(req.body)) throw new HttpException(Code.BAD_REQUEST, { message: 'Payload must be an object' });
    const newClass = plainToInstance(cls, req.body);
    const errors = await validate(newClass);
    if (errors.length) {
      throw new HttpException(Code.BAD_REQUEST, errors);
    }
    return newClass;
  }

  public handleError<E extends Error>(error: E, next: NextFunction): void {
    if (error instanceof HttpException) return next(error);
    next(new HttpException(Code.INTERNAL_SERVER_ERROR, error));
  }
}
