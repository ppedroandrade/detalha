import { z } from 'zod';
import { appDataSchema } from '@/lib/domain/schemas';
import { endpoint, actor, sameOrigin, jsonBody } from '@/lib/server/http';
import { database } from '@/lib/server/database';
import { SqlProjectRepository } from '@/lib/server/repository';
type Context={params:Promise<{projectId:string}>};
export async function GET(_request:Request,{params}:Context) {return endpoint(async()=>new SqlProjectRepository(await database(),await actor()).load((await params).projectId));}
export async function PUT(request:Request,{params}:Context) {return endpoint(async()=>{sameOrigin(request);const repo=new SqlProjectRepository(await database(),await actor());const v=z.object({data:appDataSchema,revision:z.number().int().nonnegative()}).strict().parse(await jsonBody(request));return {revision:await repo.save((await params).projectId,v.data,v.revision)};});}
