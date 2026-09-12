'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { ClientProject, PlatformData, PlatformUser } from '@/lib/types';
import { AdminDashboard } from './admin-dashboard';
import { ApartmentApp } from './apartment-app';
import { Button } from './ui/button';
import { Input } from './ui/fields';

type Snapshot={data:PlatformData;currentUser:PlatformUser;organizations:{id:string;name:string;role:string}[]};
export function PersistentPlatform({local}:{local:boolean}) {
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[ready,setReady]=useState(false),[project,setProject]=useState<ClientProject|null>(null);
  const [register,setRegister]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [organization,setOrganization]=useState('');
  async function reload() {const data=await api<Snapshot>('/api/platform');setSnapshot(data);setOrganization(current=>current||data.organizations[0]?.id||'');}
  useEffect(()=>{reload().catch(()=>{}).finally(()=>setReady(true));},[]);
  async function logout() {try {await api('/api/auth/logout','POST',{});setProject(null);setSnapshot(null);} catch(e) {toast.error((e as Error).message);}}
  if(!ready) return <p className="p-8">Carregando o portal…</p>;
  const banner=<div className="border-b bg-sage-soft px-5 py-2 text-center text-xs text-ink">{local?'Desenvolvimento local · dados persistidos no servidor':'Área privada'} · <a className="underline" href="/demo">Abrir demonstração</a></div>;
  if(!snapshot) return <>{banner}<main className="mx-auto max-w-md px-5 py-16"><p className="eyebrow">Detalha</p><h1 className="page-title mt-3">{register?'Criar organização local':'Acesse seus projetos'}</h1><p className="my-4 text-sm text-slate-500">{local?'Use uma conta local para testar a jornada persistente. A demonstração continua disponível separadamente.':'Entre com sua conta da organização.'}</p><form className="surface-card space-y-4 rounded-3xl p-6" onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');const values=Object.fromEntries(new FormData(event.currentTarget));try{if(register) await api('/api/auth/register','POST',values);await api('/api/auth/login','POST',{email:values.email,password:values.password});await reload();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>
    {register&&<><label className="block text-sm">Seu nome<Input name="name" required maxLength={120}/></label><label className="block text-sm">Organização<Input name="organization" required maxLength={120}/></label></>}
    <label className="block text-sm">E-mail<Input name="email" type="email" autoComplete="email" required/></label><label className="block text-sm">Senha<Input name="password" type="password" minLength={register?12:1} maxLength={128} autoComplete={register?'new-password':'current-password'} required/></label>
    {register&&<p className="text-xs text-slate-500">Use pelo menos 12 caracteres.</p>}{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
    <Button disabled={busy} type="submit" className="w-full">{busy?'Aguarde…':register?'Criar e entrar':'Entrar'}</Button>{local&&<Button type="button" variant="ghost" onClick={()=>setRegister(!register)}>{register?'Já tenho conta':'Criar conta local'}</Button>}
  </form></main></>;
  const current=snapshot.currentUser;
  if(project) return <ApartmentApp key={project.id} project={project} user={current} persistent onLogout={logout} onBackToAdmin={()=>setProject(null)}/>;
  if(current.role==='client') return <>{banner}<main className="mx-auto max-w-4xl space-y-4 p-8"><h1 className="page-title">Meus projetos</h1>{snapshot.data.projects.map(p=><Button key={p.id} onClick={()=>setProject(p)}>{p.name}</Button>)}{!snapshot.data.projects.length&&<p>Nenhum projeto vinculado.</p>}<Button variant="ghost" onClick={logout}>Sair</Button></main></>;
  return <>{banner}{snapshot.organizations.length>1&&<label className="block px-8 py-3">Organização <select value={organization} onChange={e=>setOrganization(e.target.value)}>{snapshot.organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}<AdminDashboard data={{...snapshot.data,projects:snapshot.data.projects.filter(p=>p.organizationId===organization)}} admin={current} persistent onOpenProject={setProject} onLogout={logout}
    onCreateClient={async values=>{await api('/api/clients','POST',{organizationId:organization,values});await reload();}}
    onUpdateUser={async(id,patch)=>{try{await api('/api/clients','PATCH',{id,active:patch.active});await reload();}catch(e){toast.error((e as Error).message);}}} onUpdateProject={()=>{toast.info('O status acompanha o processamento e a validação.');}}/></>;
}
