import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { DomainError } from '../domain/rules';
import { clientSchema, loginSchema, registrationSchema } from '../domain/schemas';
import { asActor, type Database, type Sql } from './database';

const scrypt = promisify(scryptCallback);
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password,salt,64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const key = await scrypt(password,salt,64) as Buffer;
  const expected = Buffer.from(hash ?? '', 'hex');
  return key.length === expected.length && timingSafeEqual(key,expected);
}
function supabase(admin = false) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, admin ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function rateLimit(db: Database, key: string, max: number, seconds = 900) {
  const { rows } = await db.query<{count:number}>(`INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN excluded.expires_at ELSE rate_limits.expires_at END RETURNING count`,[hashToken(key),seconds]);
  if(rows[0].count>max) throw new DomainError('Limite temporário atingido. Tente novamente mais tarde.',429);
}
export async function audit(tx: Sql, org: string, actor: string, action: string, entity: string, project: string | null = null) {
  await tx.query('INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_id,project_id) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),org,actor,action,entity,project]);
}
export async function register(db: Database, input: unknown) {
  if(config().mode !== 'local') throw new DomainError('Crie a identidade no provedor gerenciado e provisione a organização.',403);
  const v = registrationSchema.parse(input);
  const password = await hashPassword(v.password);
  const id = randomUUID(), org = randomUUID();
  await db.transaction(async tx => {
    if ((await tx.query('SELECT id FROM app_users WHERE email=$1',[v.email])).rows.length) throw new DomainError('Não foi possível cadastrar esta conta.',409);
    await tx.query('INSERT INTO app_users(id,name,email,password_hash) VALUES($1,$2,$3,$4)',[id,v.name,v.email,password]);
    await tx.query('INSERT INTO organizations(id,name) VALUES($1,$2)',[org,v.organization]);
    await tx.query("INSERT INTO organization_members VALUES($1,$2,'admin')",[org,id]);
    await audit(tx,org,id,'organization.created',org);
  });
  return { id, organizationId: org };
}
export async function signIn(db: Database, input: unknown) {
  const v = loginSchema.parse(input);
  await rateLimit(db,`login:${v.email}`,10);
  let id: string | undefined;
  if(config().mode === 'production') {
    const { data, error } = await supabase().auth.signInWithPassword(v);
    if(error) throw new DomainError('E-mail ou senha inválidos.',401);
    id = data.user?.id;
  } else {
    const { rows } = await db.query<{id:string; password_hash:string; active:boolean}>('SELECT id,password_hash,active FROM app_users WHERE email=$1',[v.email]);
    const valid = await verifyPassword(v.password, rows[0]?.password_hash ?? '00000000000000000000000000000000:' + '00'.repeat(64));
    if(valid && rows[0]?.active) id = rows[0].id;
  }
  if (!id || !(await db.query('SELECT id FROM app_users WHERE id=$1 AND active',[id])).rows.length) throw new DomainError('E-mail ou senha inválidos.',401);
  const token = randomBytes(32).toString('base64url');
  await db.query("INSERT INTO sessions VALUES($1,$2,now()+interval '8 hours')",[hashToken(token),id]);
  return token;
}
export async function authenticate(db: Database, token: string | undefined) {
  if(!token) throw new DomainError('Entre para continuar.',401);
  const { rows } = await db.query<{id:string}>(`SELECT u.id FROM sessions s JOIN app_users u ON u.id=s.user_id WHERE token_hash=$1 AND expires_at>now() AND u.active`,[hashToken(token)]);
  if(!rows[0]) throw new DomainError('Sessão expirada.',401);
  return rows[0].id;
}
export async function createClientAccount(db: Database, actor: string, organizationId: string, input: unknown) {
  const v = clientSchema.parse(input);
  const permitted = await asActor(db,actor,async tx => (await tx.query("SELECT 1 FROM organization_members WHERE organization_id=$1 AND user_id=$2 AND role='admin'",[organizationId,actor])).rows.length);
  if(!permitted) throw new DomainError('Apenas administradores podem cadastrar clientes.',403);
  const local = config().mode === 'local';
  let id = randomUUID() as string;
  if (!local) {
    const { data, error } = await supabase(true).auth.admin.createUser({ email:v.email,password:v.password,email_confirm:true });
    if(error || !data.user) throw new DomainError('Não foi possível criar a identidade.',409);
    id = data.user.id;
  }
  try {
    const password = local ? await hashPassword(v.password) : null;
    return await db.transaction(async tx => {
      // Authorization is checked again in the same transaction as the privileged identity insert.
      const admin = await tx.query("SELECT 1 FROM organization_members m JOIN app_users u ON u.id=m.user_id WHERE organization_id=$1 AND user_id=$2 AND role='admin' AND u.active",[organizationId,actor]);
      if(!admin.rows.length) throw new DomainError('Sem permissão.',403);
      if((await tx.query('SELECT id FROM app_users WHERE email=$1',[v.email])).rows.length) throw new DomainError('Não foi possível cadastrar esta conta.',409);
      await tx.query('INSERT INTO app_users(id,name,email,password_hash) VALUES($1,$2,$3,$4)',[id,v.name,v.email,password]);
      await tx.query("INSERT INTO organization_members VALUES($1,$2,'client')",[organizationId,id]);
      const clientId = randomUUID(), projectId = randomUUID();
      await tx.query('INSERT INTO clients VALUES($1,$2,$3,$4,$5)',[clientId,organizationId,id,v.name,v.email]);
      await tx.query('INSERT INTO projects(id,organization_id,client_id,name) VALUES($1,$2,$3,$4)',[projectId,organizationId,clientId,v.projectName]);
      await audit(tx,organizationId,actor,'client.created',clientId,projectId);
      return { id, projectId };
    });
  } catch(e) {
    if(!local) { const {error} = await supabase(true).auth.admin.deleteUser(id); if(error) console.error(JSON.stringify({ event:'identity.cleanup_failed', code:'AUTH_CLEANUP' })); }
    throw e;
  }
}
