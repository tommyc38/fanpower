import { Pool } from 'pg';
import { env } from '../../../environments';
import { env as localEnv } from '../../../environments/env.local';

export const db = new Pool({
  max: 20,
  user: env.PG_USER || localEnv.PG_USER,
  host: env.PG_HOST || localEnv.PG_HOST,
  database: env.PG_DB || localEnv.PG_DB,
  password: env.PG_PASSWORD || localEnv.PG_PASSWORD,
  port: env.PG_PORT || localEnv.PG_PORT,
  idleTimeoutMillis: 30000,
});
