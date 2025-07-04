import { Pool } from 'pg';

let pool: Pool;

if (!global.pg) {
  global.pg = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// eslint-disable-next-line prefer-const
pool = global.pg;

export { pool };

declare global {
  var pg: Pool | undefined;
}