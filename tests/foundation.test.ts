import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase, migrate, asActor } from '../lib/server/database';
import { register, signIn, authenticate, createClientAccount } from '../lib/server/auth';
import { SqlProjectRepository, platformSnapshot, setClientActive } from '../lib/server/repository';
import { meters, transition } from '../lib/domain/rules';
import { emptyProjectData } from '../lib/seed';

test('persistência, isolamento real por RLS, autenticação e revisão concorrente',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'detalha-test-'));
  let db=await openDatabase(dir);
  try {
    await migrate(db); await migrate(db);
    const a=await register(db,{name:'Pessoa fictícia A',organization:'Empresa fictícia A',email:'a@example.invalid',password:'senha-local-1234'});
    const b=await register(db,{name:'Pessoa fictícia B',organization:'Empresa fictícia B',email:'b@example.invalid',password:'senha-local-1234'});
    const c=await createClientAccount(db,a.id,a.organizationId,{name:'Cliente fictício',email:'c@example.invalid',password:'senha-local-1234',projectName:'Projeto fictício'});
    const d=await createClientAccount(db,a.id,a.organizationId,{name:'Outro cliente',email:'d@example.invalid',password:'senha-local-1234',projectName:'Outro projeto'});
    const token=await signIn(db,{email:'a@example.invalid',password:'senha-local-1234'});
    assert.equal(await authenticate(db,token),a.id);
    await assert.rejects(signIn(db,{email:'a@example.invalid',password:'errada'}));
    await assert.rejects(authenticate(db,'token-forjado'));
    await assert.rejects(createClientAccount(db,b.id,a.organizationId,{name:'X',email:'x@example.invalid',password:'senha-local-1234',projectName:'X'}));
    const repo=new SqlProjectRepository(db,a.id);
    await repo.save(c.projectId,emptyProjectData,0);
    assert.equal((await repo.load(c.projectId)).data.environments.length,emptyProjectData.environments.length);
    await assert.rejects(repo.save(c.projectId,emptyProjectData,0),/outra sessão/);
    await assert.rejects(new SqlProjectRepository(db,b.id).load(c.projectId));
    await assert.rejects(new SqlProjectRepository(db,d.id).load(c.projectId));
    await new SqlProjectRepository(db,c.id).save(c.projectId,emptyProjectData,1);
    const direct=await asActor(db,b.id,tx=>tx.query('SELECT * FROM projects'));
    assert.equal(direct.rows.length,0);
    const own=await platformSnapshot(db,c.id);
    assert.equal(own.data.projects.length,1);
    assert.equal('password_hash' in own.currentUser,false);
    await assert.rejects(asActor(db,c.id,tx=>tx.query('SELECT password_hash FROM app_users')));
    await setClientActive(db,a.id,c.id,false);
    await assert.rejects(new SqlProjectRepository(db,c.id).load(c.projectId));
    await db.close(); db=await openDatabase(dir);
    assert.equal((await new SqlProjectRepository(db,a.id).load(c.projectId)).revision,2);
  } finally {await db.close();await rm(dir,{recursive:true,force:true});}
});
test('unidades e transições nunca completam medidas ou aprovam conflitos',()=>{
  assert.equal(meters(160,'cm'),1.6); assert.equal(meters(1250,'mm'),1.25);
  assert.throws(()=>meters(0,'m')); assert.throws(()=>meters(NaN,'m'));
  assert.throws(()=>transition('Coleta de arquivos','Publicado'));
  assert.throws(()=>transition('Aguardando validação','Pronto para modelagem'));
  assert.equal(transition('Aguardando validação','Pronto para modelagem',{structuralComplete:true,unapprovedDimensions:0,criticalConflicts:0,unacceptedAssumptions:0}),'Pronto para modelagem');
});
