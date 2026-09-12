import { readFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config';
export interface Sql { query<T = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[] }> }
export interface Database extends Sql { transaction<T>(fn: (sql: Sql) => Promise<T>): Promise<T>; close(): Promise<void> }
export async function openDatabase(directory?: string): Promise<Database> {
  if (config().mode === 'production' && directory === undefined) {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
    return {
      query: async <T>(q: string, v?: unknown[]) => ({ rows: (await pool.query(q, v)).rows as T[] }),
      transaction: async fn => { const c = await pool.connect(); try { await c.query('BEGIN'); const r = await fn({ query: async <T>(q: string,v?:unknown[]) => ({rows:(await c.query(q,v)).rows as T[]}) }); await c.query('COMMIT'); return r; } catch(e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); } },
      close: () => pool.end(),
    };
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const dir = directory ?? join(config().directory, 'postgres');
  if (dir !== 'memory://') await mkdir(dir, { recursive: true, mode: 0o700 });
  const db = new PGlite(dir);
  await db.waitReady;
  const wrap = (tx: Pick<typeof db, 'query' | 'exec'>): Sql => ({ query: async <T>(s: string,v?: unknown[]) => v ? tx.query<T>(s,v) : {rows: ((await tx.exec(s)).at(-1)?.rows ?? []) as T[]} });
  return { ...wrap(db), transaction: fn => db.transaction(tx => fn(wrap(tx))), close: () => db.close() };
}
export async function migrate(db: Database) {
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const dir = join(process.cwd(),'db/migrations');
  for (const name of (await readdir(dir)).filter(n => n.endsWith('.up.sql')).sort()) {
    await db.transaction(async tx => {
      await tx.query('LOCK TABLE schema_migrations IN EXCLUSIVE MODE');
      if ((await tx.query('SELECT name FROM schema_migrations WHERE name=$1',[name])).rows.length) return;
      await tx.query(await readFile(join(dir,name),'utf8'));
      await tx.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);
    });
  }
}
const globalDb = globalThis as typeof globalThis & { detalhaDb?: Promise<Database> };
export function database() {
  return globalDb.detalhaDb ??= (async () => { const db = await openDatabase(); if(config().mode !== 'production') await migrate(db); return db; })();
}
export function asActor<T>(db: Database, userId: string, fn: (sql: Sql) => Promise<T>) {
  return db.transaction(async tx => {
    await tx.query("SELECT set_config('app.user_id',$1,true)",[userId]);
    await tx.query('SET LOCAL ROLE detalha_app');
    return fn(tx);
  });
}
