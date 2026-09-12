// Identidade deve existir no Supabase Auth; nenhuma senha é aceita por este script.
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { openDatabase } from '../lib/server/database';
async function main() {
  const [id,organization]=process.argv.slice(2);
  if(!id || !organization) throw new Error('Uso: npm run provision -- <supabase-user-id> <organização>');
  const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});
  const {data,error}=await client.auth.admin.getUserById(id);
  if(error || !data.user?.email) throw new Error('Identidade não encontrada');
  const db=await openDatabase();
  try {await db.transaction(async tx=>{
    const org=randomUUID();
    await tx.query('INSERT INTO app_users(id,name,email) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',[id,data.user.user_metadata.name ?? 'Administrador',data.user.email]);
    await tx.query('INSERT INTO organizations(id,name) VALUES($1,$2)',[org,organization]);
    await tx.query("INSERT INTO organization_members VALUES($1,$2,'admin')",[org,id]);
  });console.log('Organização provisionada.');} finally {await db.close();}
}
main().catch(()=>{console.error('Falha ao provisionar; confira a configuração e a identidade.');process.exitCode=1;});
