import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabase, migrate } from '../lib/server/database';
import { register, createClientAccount } from '../lib/server/auth';
import { uploadFile, listFiles, editFile, createDownload, downloadFile } from '../lib/server/files';
import { LocalPrivateStorage } from '../lib/server/storage';
import { validateFile } from '../lib/domain/documents';
const pdf=Buffer.from('%PDF-1.4\n% synthetic upload fixture\n%%EOF');
test('upload privado, substituição, quota, autorização e expiração',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'detalha-files-'));const db=await openDatabase('memory://');const store=new LocalPrivateStorage(dir);
  try {
    await migrate(db);
    const admin=await register(db,{name:'Admin fictício',organization:'Empresa fictícia',email:'a@example.invalid',password:'senha-local-1234'});
    const other=await register(db,{name:'Outro fictício',organization:'Outra fictícia',email:'b@example.invalid',password:'senha-local-1234'});
    const client=await createClientAccount(db,admin.id,admin.organizationId,{name:'Cliente fictício',email:'c@example.invalid',password:'senha-local-1234',projectName:'Projeto fictício'});
    const metadata={name:'planta-ficticia.pdf',mime:'application/pdf',classification:'planta'};
    const first=await uploadFile(db,store,admin.id,client.projectId,metadata,pdf);
    const second=await uploadFile(db,store,admin.id,client.projectId,{...metadata,fileId:first.fileId},pdf);
    const files=await listFiles(db,admin.id,client.projectId);
    assert.equal(files.length,2); assert.equal(files.find(f=>f.id===first.id)?.selected,false);assert.equal(second.version,2);
    assert.equal((await listFiles(db,client.id,client.projectId)).length,2);
    await assert.rejects(uploadFile(db,store,client.id,client.projectId,metadata,pdf));
    await assert.rejects(listFiles(db,other.id,client.projectId));
    await assert.rejects(uploadFile(db,store,other.id,client.projectId,metadata,pdf));
    await assert.rejects(uploadFile(db,store,admin.id,client.projectId,metadata,Buffer.from('<script/>')));
    const link=await createDownload(db,client.id,client.projectId,first.id),token=link.url.split('/').at(-1)!;
    assert.deepEqual((await downloadFile(db,store,client.id,token)).bytes,pdf);
    await assert.rejects(downloadFile(db,store,other.id,token));
    await db.query("UPDATE download_grants SET expires_at=now()-interval '1 second'");
    await assert.rejects(downloadFile(db,store,client.id,token));
    await editFile(db,admin.id,client.projectId,second.id,{archive:true});
    await assert.rejects(editFile(db,admin.id,client.projectId,second.id,{selected:true}));
    assert.equal((await listFiles(db,admin.id,client.projectId)).length,2);
    process.env.MAX_PROJECT_FILES='2';
    await assert.rejects(uploadFile(db,store,admin.id,client.projectId,metadata,pdf),/Limite/);
    delete process.env.MAX_PROJECT_FILES;
    await assert.rejects(store.get('../../etc/passwd'));
  } finally {await db.close();await rm(dir,{recursive:true,force:true});}
});
test('extensão, assinatura e tamanho são verificados juntos',()=>{
  validateFile('teste.pdf','application/pdf',pdf,1000);
  assert.throws(()=>validateFile('teste.png','image/png',pdf,1000));
  assert.throws(()=>validateFile('../teste.pdf','application/pdf',pdf,1000));
  assert.throws(()=>validateFile('teste.pdf','application/pdf',pdf,2));
  assert.throws(()=>validateFile('teste.pdf','application/pdf',Buffer.alloc(0),1000));
});
