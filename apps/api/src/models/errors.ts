export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum Code {
  OK = 'Ok',
  CREATED = 'Created',
  BAD_REQUEST = 'Bad Request',
  NOT_FOUND = 'Not Found',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}

export class HttpException extends Error {
  public metadata: any = null;
  public status: number;
  constructor(
    code: string  = Code.BAD_REQUEST,
    metadata: any = null
  ) {
    super();
    this.name = code;
    this.status = HttpStatus.BAD_REQUEST;
    this.metadata = metadata;
    this.statusInit();
  }

  private statusInit() {
   switch (this.message) {

     case Code.BAD_REQUEST:
       this.status = HttpStatus.BAD_REQUEST
       break;

     case Code.INTERNAL_SERVER_ERROR:
       this.status = HttpStatus.INTERNAL_SERVER_ERROR
       break

   }

  }
}
