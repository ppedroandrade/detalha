import { openDatabase, migrate } from '../lib/server/database';
async function main() { const db = await openDatabase(); try { await migrate(db); console.log('Migrações aplicadas.'); } finally { await db.close(); } }
main().catch(()=>{console.error('Migração falhou; confira a configuração do banco.');process.exitCode=1;});
