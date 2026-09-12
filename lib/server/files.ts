import { randomUUID, randomBytes } from 'node:crypto';
import type { ProjectFileVersion } from '../domain/documents';
import { validateFile } from '../domain/documents';
import { classifications } from '../domain/schemas';
import { DomainError } from '../domain/rules';
import { z } from 'zod';
import { asActor, type Database } from './database';
import { audit, hashToken } from './auth';
import { requireProject } from './repository';
import type { PrivateStorage } from './storage';
import { limit } from './config';
const metadata=z.object({name:z.string(),mime:z.string(),classification:z.enum(classifications),fileId:z.string().optional()}).strict();
export async function listFiles(db:Database,actor:string,projectId:string) {
  return asActor(db,actor,async tx=>{
    await requireProject(tx,projectId);
    const {rows}=await tx.query<ProjectFileVersion>(`SELECT v.id,v.file_id AS "fileId",v.project_id AS "projectId",v.version,v.name,v.mime,v.size::int,v.hash,coalesce(u.name,'Equipe do projeto') AS author,v.status,v.selected,f.classification,v.created_at AS "createdAt" FROM project_file_versions v JOIN project_files f ON f.id=v.file_id LEFT JOIN app_users u ON u.id=v.author_id WHERE v.project_id=$1 ORDER BY v.created_at DESC`,[projectId]);
    return rows;
  });
}
export async function uploadFile(db:Database,store:PrivateStorage,actor:string,projectId:string,input:unknown,bytes:Buffer) {
  const v=metadata.parse(input); validateFile(v.name,v.mime,bytes,limit('MAX_FILE_BYTES',20*1024*1024));
  let storageKey:string|undefined;
  try {
    return await asActor(db,actor,async tx=>{
      const p=await requireProject(tx,projectId,true);
      // One organization lock covers concurrent quota checks and version allocation.
      await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))',[p.organization_id]);
      const usage=await tx.query<{bytes:string;count:string}>(`SELECT coalesce(sum(v.size),0) AS bytes,count(*) FILTER (WHERE v.project_id=$2) AS count FROM project_file_versions v JOIN projects p ON p.id=v.project_id WHERE p.organization_id=$1`,[p.organization_id,projectId]);
      if(Number(usage.rows[0].bytes)+bytes.length>limit('MAX_ORGANIZATION_BYTES',512*1024*1024)||Number(usage.rows[0].count)>=limit('MAX_PROJECT_FILES',100)) throw new DomainError('Limite de armazenamento atingido.',413);
      const fileId=v.fileId ?? randomUUID();
      let version=1;
      if(v.fileId) {
        const old=await tx.query<{version:number}>('SELECT max(version)::int AS version FROM project_file_versions WHERE file_id=$1 AND project_id=$2',[fileId,projectId]);
        if(!old.rows[0]?.version) throw new DomainError('Arquivo original não encontrado.',404);
        version=old.rows[0].version+1;
        await tx.query('UPDATE project_file_versions SET selected=false WHERE file_id=$1',[fileId]);
      } else await tx.query('INSERT INTO project_files(id,project_id,classification) VALUES($1,$2,$3)',[fileId,projectId,v.classification]);
      const id=randomUUID();storageKey=`${p.organization_id}/${projectId}/${id}`;
      await store.put(storageKey,bytes,v.mime);
      await tx.query('INSERT INTO project_file_versions(id,file_id,project_id,version,name,mime,size,hash,storage_key,author_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,fileId,projectId,version,v.name,v.mime,bytes.length,hashToken(bytes),storageKey,actor]);
      await audit(tx,p.organization_id,actor,v.fileId?'file.replaced':'file.uploaded',id,projectId);
      return {id,fileId,version};
    });
  } catch(e) {if(storageKey) await store.remove(storageKey).catch(()=>{console.error(JSON.stringify({event:'storage.cleanup_failed',code:'ORPHAN_OBJECT'}));});throw e;}
}
export async function editFile(db:Database,actor:string,projectId:string,versionId:string,input:unknown) {
  const v=z.object({classification:z.enum(classifications).optional(),selected:z.boolean().optional(),archive:z.literal(true).optional()}).strict().parse(input);
  return asActor(db,actor,async tx=>{
    const p=await requireProject(tx,projectId,true);
    const {rows}=await tx.query<{file_id:string;status:string}>('SELECT file_id,status FROM project_file_versions WHERE id=$1 AND project_id=$2 FOR UPDATE',[versionId,projectId]);
    if(!rows[0]) throw new DomainError('Versão não encontrada.',404);
    if(['queued','processing'].includes(rows[0].status)) throw new DomainError('Aguarde o processamento desta versão.',409);
    if(v.selected && rows[0].status==='archived') throw new DomainError('Versão arquivada não pode ser analisada.',409);
    if(v.classification) await tx.query('UPDATE project_files SET classification=$1 WHERE id=$2',[v.classification,rows[0].file_id]);
    if(v.selected!==undefined) await tx.query('UPDATE project_file_versions SET selected=$1 WHERE id=$2',[v.selected,versionId]);
    if(v.archive) await tx.query("UPDATE project_file_versions SET status='archived',selected=false WHERE id=$1",[versionId]);
    await audit(tx,p.organization_id,actor,v.archive?'file.archived':'file.metadata_changed',versionId,projectId);
    return {ok:true};
  });
}
export async function createDownload(db:Database,actor:string,projectId:string,versionId:string) {
  await asActor(db,actor,async tx=>{await requireProject(tx,projectId);if(!(await tx.query('SELECT id FROM project_file_versions WHERE id=$1 AND project_id=$2',[versionId,projectId])).rows.length) throw new DomainError('Arquivo não encontrado.',404);});
  const token=randomBytes(32).toString('base64url');
  await db.query("INSERT INTO download_grants VALUES($1,$2,$3,now()+$4*interval '1 second')",[hashToken(token),versionId,actor,Math.min(limit('SIGNED_URL_TTL_SECONDS',60),300)]);
  return {url:`/api/files/download/${token}`};
}
export async function downloadFile(db:Database,store:PrivateStorage,actor:string,token:string) {
  const {rows}=await db.query<{version_id:string}>('SELECT version_id FROM download_grants WHERE token_hash=$1 AND user_id=$2 AND expires_at>now()',[hashToken(token),actor]);
  if(!rows[0]) throw new DomainError('Link expirado ou inválido.',404);
  return asActor(db,actor,async tx=>{
    const file=await tx.query<{storage_key:string;mime:string}>('SELECT storage_key,mime FROM project_file_versions WHERE id=$1',[rows[0].version_id]);
    if(!file.rows[0]) throw new DomainError('Arquivo indisponível.',404);
    return {bytes:await store.get(file.rows[0].storage_key),mime:file.rows[0].mime};
  });
}
