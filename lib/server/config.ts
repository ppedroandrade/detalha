import { resolve } from 'node:path';
export function config() {
  const mode = process.env.DETALHA_MODE ?? 'local';
  if (!['demo','local','production'].includes(mode)) throw new Error('DETALHA_MODE inválido');
  if (mode === 'production') for (const key of ['DATABASE_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','APP_URL']) if (!process.env[key]) throw new Error(`Configuração ausente: ${key}`);
  const directory = resolve(process.env.LOCAL_DATA_DIR ?? '.detalha');
  if (directory === resolve('public') || directory.startsWith(resolve('public') + '/')) throw new Error('Storage deve ser privado');
  return { mode, directory, appUrl: process.env.APP_URL ?? 'http://localhost:3000' };
}
export function limit(key: string, fallback: number) {
  const n = Number(process.env[key] ?? fallback);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`Limite inválido: ${key}`);
  return n;
}
