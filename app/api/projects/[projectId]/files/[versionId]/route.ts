import { endpoint, actor, sameOrigin, jsonBody } from '@/lib/server/http';
import { database } from '@/lib/server/database';
import { editFile, createDownload } from '@/lib/server/files';
type Context={params:Promise<{projectId:string;versionId:string}>};
export async function PATCH(r:Request,{params}:Context) {return endpoint(async()=>{sameOrigin(r);const {projectId,versionId}=await params;return editFile(await database(),await actor(),projectId,versionId,await jsonBody(r,4096));});}
export async function POST(r:Request,{params}:Context) {return endpoint(async()=>{sameOrigin(r);const {projectId,versionId}=await params;return createDownload(await database(),await actor(),projectId,versionId);});}
