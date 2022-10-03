import 'reflect-metadata';
import { Server } from './server';

const port = process.env.port || 3333;

const server = new Server()
  .start(port)
  .then((port) => console.log(`Running on localhost:${port}`))
  .catch((error) => {
    console.log(error);
  });

export default server;
