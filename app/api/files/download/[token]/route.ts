import { endpoint, actor } from '@/lib/server/http';
import { database } from '@/lib/server/database';
import { storage } from '@/lib/server/storage';
import { downloadFile } from '@/lib/server/files';
export async function GET(_r:Request,{params}:{params:Promise<{token:string}>}) {return endpoint(async()=>{
  const value=await downloadFile(await database(),storage(),await actor(),(await params).token);
  return new Response(new Uint8Array(value.bytes),{headers:{'Content-Type':value.mime,'Content-Disposition':'inline','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'; frame-ancestors 'self'"}});
});}
