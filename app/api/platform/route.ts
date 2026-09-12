import { endpoint, actor } from '@/lib/server/http';
import { database } from '@/lib/server/database';
import { platformSnapshot } from '@/lib/server/repository';
export async function GET() {return endpoint(async()=>platformSnapshot(await database(),await actor()));}
