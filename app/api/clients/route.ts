import { z } from 'zod';
import { endpoint, actor, sameOrigin, jsonBody } from '@/lib/server/http';
import { database } from '@/lib/server/database';
import { createClientAccount } from '@/lib/server/auth';
import { setClientActive } from '@/lib/server/repository';
import { clientSchema } from '@/lib/domain/schemas';
export async function POST(request:Request) {return endpoint(async()=>{sameOrigin(request);const user=await actor();const v=z.object({organizationId:z.string(),values:clientSchema}).strict().parse(await jsonBody(request,8192));return createClientAccount(await database(),user,v.organizationId,v.values);});}
export async function PATCH(request:Request) {return endpoint(async()=>{sameOrigin(request);const user=await actor();const v=z.object({id:z.string(),active:z.boolean()}).strict().parse(await jsonBody(request,4096));await setClientActive(await database(),user,v.id,v.active);return {ok:true};});}
