import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
export interface PrivateStorage {
  put(key:string,bytes:Buffer,mime:string):Promise<void>;
  get(key:string):Promise<Buffer>;
  remove(key:string):Promise<void>;
}
function validateKey(key:string) {if(!/^[a-f0-9-]+\/[a-f0-9-]+\/[a-f0-9-]+$/.test(key)) throw new Error('Chave de storage inválida');}
export class LocalPrivateStorage implements PrivateStorage {
  constructor(private root=join(config().directory,'files')) {}
  async put(key:string,bytes:Buffer) {validateKey(key);const path=join(this.root,key);await mkdir(join(path,'..'),{recursive:true,mode:0o700});await writeFile(path,bytes,{mode:0o600,flag:'wx'});}
  async get(key:string) {validateKey(key);return readFile(join(this.root,key));}
  async remove(key:string) {validateKey(key);await unlink(join(this.root,key));}
}
export class SupabasePrivateStorage implements PrivateStorage {
  private client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  private bucket=process.env.STORAGE_BUCKET ?? 'project-documents';
  async put(key:string,bytes:Buffer,mime:string) {validateKey(key);const {error}=await this.client.storage.from(this.bucket).upload(key,bytes,{contentType:mime,upsert:false});if(error) throw new Error('Storage indisponível');}
  async get(key:string) {validateKey(key);const {data,error}=await this.client.storage.from(this.bucket).download(key);if(error||!data) throw new Error('Storage indisponível');return Buffer.from(await data.arrayBuffer());}
  async remove(key:string) {validateKey(key);const {error}=await this.client.storage.from(this.bucket).remove([key]);if(error) throw new Error('Storage indisponível');}
}
export function storage():PrivateStorage {return config().mode==='production'?new SupabasePrivateStorage():new LocalPrivateStorage();}
