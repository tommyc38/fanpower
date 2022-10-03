import { Application } from 'express';
import * as express from 'express';
import Routes from './app/routes';
import { env } from './environments';
import * as BodyParser from 'body-parser';
import { errorHandler } from './app/middleware';
import { db } from './app/services';

export class Server {
  private app: Application;
  private readonly routePrefix: string;

  constructor() {
    this.app = express();
    this.routePrefix = `/api/${env.API_VERSION}`;
    this.preConfig();
    this.routerConfig();
    this.dbConnect();
    this.postConfig();
  }

  private preConfig() {
    this.app.use(BodyParser.urlencoded({ extended: true }));
    this.app.use(BodyParser.json({ limit: '1mb' })); // 100kb default
  }

  private postConfig() {
    this.app.use(errorHandler);
  }

  public start(port: string | number) {
    if (typeof port === 'string') {
      port = parseInt(port);
    }
    return new Promise((resolve, reject) => {
      this.app
        .listen(port, () => {
          resolve(port);
        })
        .on('error', (err: Record<string, unknown>) => reject(err));
    });
  }

  private dbConnect() {
    db.connect((err) => {
      if (err) throw new Error(err);
      console.log('Postgres DB Connected!');
    });
  }

  private routerConfig() {
    this.app.use(this.routePrefix, Routes.GameRouter);
  }
}
