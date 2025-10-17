import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: '0645',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'dashboard_db'
});

export function query(text: any): any {
    return pool.query(text);
};