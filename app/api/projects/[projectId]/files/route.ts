import { endpoint, actor, sameOrigin, limitedBytes } from '@/lib/server/http';
import { database, asActor } from '@/lib/server/database';
import { requireProject } from '@/lib/server/repository';
import { storage } from '@/lib/server/storage';
import { listFiles, uploadFile } from '@/lib/server/files';
import { limit } from '@/lib/server/config';
import { rateLimit } from '@/lib/server/auth';
type Context={params:Promise<{projectId:string}>};
export async function GET(_r:Request,{params}:Context) {return endpoint(async()=>listFiles(await database(),await actor(),(await params).projectId));}
export async function POST(request:Request,{params}:Context) {return endpoint(async()=>{
  sameOrigin(request);const db=await database(),user=await actor(),{projectId}=await params;
  await asActor(db,user,tx=>requireProject(tx,projectId,true));
  await rateLimit(db,`upload:${user}`,100);
  const q=new URL(request.url).searchParams;
  const bytes=await limitedBytes(request,limit('MAX_FILE_BYTES',20*1024*1024));
  return uploadFile(db,storage(),user,projectId,{name:q.get('name'),mime:request.headers.get('content-type'),classification:q.get('classification')??'outro',...(q.get('fileId')?{fileId:q.get('fileId')}:{})},bytes);
});}
