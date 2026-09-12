import type { AppData, PlatformData, PlatformUser } from '../types';
import { appDataSchema } from '../domain/schemas';
import { DomainError } from '../domain/rules';
import { asActor, type Database, type Sql } from './database';
import { audit } from './auth';

export interface ProjectRepository {
  load(projectId: string): Promise<{ data: AppData; revision: number }>;
  save(projectId: string, data: AppData, revision: number): Promise<number>;
}
export async function requireProject(tx: Sql, id: string, write = false) {
  const {rows} = await tx.query<{id:string; organization_id:string; status:string; revision:number}>(`SELECT id,organization_id,status,revision FROM projects WHERE id=$1${write ? ' AND staff_project(id)' : ''}`,[id]);
  if(!rows[0]) throw new DomainError('Projeto não encontrado ou sem permissão.',404);
  return rows[0];
}
export class SqlProjectRepository implements ProjectRepository {
  constructor(private db: Database, private actor: string) {}
  load(projectId: string) {
    return asActor(this.db,this.actor,async tx => {
      const project = await requireProject(tx,projectId);
      const environments = await tx.query<{data:AppData['environments'][number]}>('SELECT data FROM environments WHERE project_id=$1 ORDER BY id',[projectId]);
      const items = await tx.query<{data:AppData['items'][number]}>('SELECT data FROM apartment_items WHERE project_id=$1 ORDER BY id',[projectId]);
      return {data:{environments:environments.rows.map(e=>e.data),items:items.rows.map(e=>e.data)}, revision:project.revision};
    });
  }
  save(projectId:string, input:AppData, revision:number) {
    const data = appDataSchema.parse(input);
    return asActor(this.db,this.actor,async tx => {
      const p = await requireProject(tx,projectId);
      // Revision function permits client edits to specifications, never lifecycle state.
      const {rows} = await tx.query<{revision:number}>('SELECT bump_project_revision($1,$2) AS revision',[projectId,revision]);
      if(rows[0].revision === null) throw new DomainError('O projeto foi alterado em outra sessão. Recarregue antes de salvar.',409);
      await tx.query('DELETE FROM apartment_items WHERE project_id=$1',[projectId]);
      await tx.query('DELETE FROM environments WHERE project_id=$1',[projectId]);
      for(const e of data.environments) await tx.query('INSERT INTO environments VALUES($1,$2,$3)',[e.id,projectId,JSON.stringify(e)]);
      for(const i of data.items) await tx.query('INSERT INTO apartment_items VALUES($1,$2,$3,$4)',[i.id,projectId,i.environmentId,JSON.stringify(i)]);
      await audit(tx,p.organization_id,this.actor,'specifications.saved',projectId,projectId);
      return rows[0].revision;
    });
  }
}
export async function platformSnapshot(db:Database, actor:string) {
  return asActor(db,actor,async tx => {
    const users = await tx.query<PlatformUser>(`SELECT u.id,u.name,u.email,u.active,u.created_at AS "createdAt", CASE WHEN EXISTS(SELECT 1 FROM organization_members m WHERE m.user_id=u.id AND m.role IN ('admin','designer')) THEN 'admin' ELSE 'client' END AS role FROM app_users u`);
    const projects = await tx.query<PlatformData['projects'][number]>(`SELECT p.id,p.name,c.user_id AS "clientId",p.organization_id AS "organizationId",p.status,p.created_at AS "createdAt" FROM projects p JOIN clients c ON c.id=p.client_id ORDER BY p.created_at`);
    const organizations = await tx.query<{id:string;name:string;role:string}>('SELECT o.id,o.name,m.role FROM organizations o JOIN organization_members m ON m.organization_id=o.id WHERE m.user_id=$1',[actor]);
    return { data:{users:users.rows,projects:projects.rows}, currentUser:users.rows.find(u=>u.id===actor)!, organizations:organizations.rows };
  });
}
export async function setClientActive(db:Database, actor:string, id:string, active:boolean) {
  await db.transaction(async tx => {
    const {rows} = await tx.query<{organization_id:string}>(`SELECT m.organization_id FROM organization_members m JOIN organization_members target ON target.organization_id=m.organization_id JOIN app_users u ON u.id=m.user_id WHERE m.user_id=$1 AND m.role='admin' AND target.user_id=$2 AND target.role='client' AND u.active`,[actor,id]);
    if(!rows[0]) throw new DomainError('Sem permissão.',403);
    await tx.query('UPDATE app_users SET active=$1 WHERE id=$2',[active,id]);
    if(!active) await tx.query('DELETE FROM sessions WHERE user_id=$1',[id]);
    await audit(tx,rows[0].organization_id,actor,'client.access_changed',id);
  });
}
