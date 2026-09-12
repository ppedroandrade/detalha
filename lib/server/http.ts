import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DomainError } from '../domain/rules';
import { authenticate } from './auth';
import { database } from './database';
import { config } from './config';
export async function actor() { return authenticate(await database(),(await cookies()).get('detalha_session')?.value); }
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(config().appUrl).origin) throw new DomainError('Origem não permitida.',403);
}
export async function jsonBody(request:Request, max = 3_000_000) {
  const bytes = await limitedBytes(request,max);
  try { return JSON.parse(bytes.toString('utf8')) as unknown; } catch { throw new DomainError('JSON inválido'); }
}
export async function limitedBytes(request:Request,max:number) {
  if(Number(request.headers.get('content-length'))>max) throw new DomainError('Arquivo ou requisição excede o limite.',413);
  const reader=request.body?.getReader();
  if(!reader) throw new DomainError('Conteúdo ausente.');
  const chunks:Uint8Array[]=[]; let size=0;
  try { while(true) {const {value,done}=await reader.read(); if(done) break; size+=value.length; if(size>max) {await reader.cancel(); throw new DomainError('Arquivo ou requisição excede o limite.',413);} chunks.push(value);} } finally {reader.releaseLock();}
  return Buffer.concat(chunks);
}
export async function endpoint(fn:()=>Promise<unknown>) {
  try { const value = await fn(); return value instanceof Response ? value : NextResponse.json(value,{headers:{'Cache-Control':'no-store'}}); }
  catch(e) {
    if(e instanceof DomainError) return NextResponse.json({error:e.message},{status:e.status});
    if(e instanceof ZodError) return NextResponse.json({error:'Dados inválidos. Confira os campos e os limites.'},{status:400});
    console.error(JSON.stringify({event:'request.failed',code:'INTERNAL_ERROR'}));
    return NextResponse.json({error:'Não foi possível concluir a operação.'},{status:500});
  }
}
