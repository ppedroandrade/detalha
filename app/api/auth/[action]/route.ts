import { cookies } from 'next/headers';
import { database } from '@/lib/server/database';
import { hashToken, register, signIn, rateLimit } from '@/lib/server/auth';
import { endpoint, sameOrigin, jsonBody } from '@/lib/server/http';
import { config } from '@/lib/server/config';
import { DomainError } from '@/lib/domain/rules';
export const runtime='nodejs';
export async function POST(request:Request, {params}:{params:Promise<{action:string}>}) {
  return endpoint(async()=>{
    sameOrigin(request);
    if(config().mode==='demo') throw new DomainError('Use o acesso demonstrativo.',403);
    const {action}=await params, db=await database();
    const jar=await cookies();
    if(action==='logout') {const token=jar.get('detalha_session')?.value;if(token) await db.query('DELETE FROM sessions WHERE token_hash=$1',[hashToken(token)]);jar.delete('detalha_session');return {ok:true};}
    if(action==='register') {await rateLimit(db,'register-global',20);return register(db,await jsonBody(request,4096));}
    if(action!=='login') throw new DomainError('Ação inexistente.',404);
    await rateLimit(db,'login-global',200);
    const token=await signIn(db,await jsonBody(request,4096));
    jar.set('detalha_session',token,{httpOnly:true,secure:config().mode==='production',sameSite:'lax',path:'/',maxAge:8*3600});
    return {ok:true};
  });
}
