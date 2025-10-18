import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: '0645',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'dashboard_db'
});

export function query(text: string, params?: any[]): Promise<QueryResult> {
    return pool.query(text, params);
};