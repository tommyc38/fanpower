import { Env } from '../models';

export const env: Env = {
  NODE_ENV: 'local',
  API_URL: '',
  API_VERSION: 'v1',
  PG_CONNECTION: 'local',
  PG_PASSWORD: 'password',
  PG_USER: 'local',
  PG_HOST: 'localhost',
  PG_PORT: 5432,
  PG_DB: 'fanpower-db'
};
