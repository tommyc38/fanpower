import { catchError, EMPTY, OperatorFunction } from 'rxjs';

export interface ErrorHandler {
  status: number | 'default'
  toast: {message: string, title: string},
  onError?: (error?: Error) => void

}

export interface ErrorDetails {
  message: string,
  name: string,
  status?: number;
  url?: string;
}

export class HttpError extends Error {
  override message  = 'A network error occurred';
  override name: string
  status: number;
  url: string
  constructor(res: Response, message?: string) {
    super(message);
    if(message) this.message = message;
    this.name = res.statusText;
    this.url = res.url;
    this.status = res.status;
  }
}


export const handleError= <S,T> (store: S, handler: ErrorHandler ): OperatorFunction<T, T> => {
  return catchError((error: Error) => {
    const { status, toast, onError} = handler;
    const errorDetails = parseError(error);

    return EMPTY;
    })
}

const parseError = (error: Error): ErrorDetails => {

  const errorDetails: ErrorDetails = {
    message:  'There was an error',
    name: 'unknown'
  }

  if (error instanceof HttpError) {

    errorDetails.url = error.url;
    errorDetails.message = error.message;
    errorDetails.status = error.status;
    errorDetails.name = error.name;

  } else {
    errorDetails.message = error.message;
    errorDetails.name = error.name;
  }

  return errorDetails;
}
