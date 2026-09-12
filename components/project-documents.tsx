'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { ProjectFileVersion } from '@/lib/domain/documents';
import { classifications } from '@/lib/domain/schemas';
import { documentMessages, fileStatusLabels } from '@/lib/i18n/documents';
import { Button } from './ui/button';
import { Select } from './ui/fields';
import { Dialog } from './ui/dialog';
const t=documentMessages.pt;
export function ProjectDocuments({projectId,canEdit}:{projectId:string;canEdit:boolean}) {
  const [files,setFiles]=useState<ProjectFileVersion[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [preview,setPreview]=useState<{name:string;url:string}|null>(null);
  const base=`/api/projects/${projectId}/files`;
  const reload=useCallback(async()=>{setFiles(await api<ProjectFileVersion[]>(base));setLoading(false);},[base]);
  useEffect(()=>{reload().catch(e=>{setError(e.message);setLoading(false);});},[reload]);
  async function upload(incoming:FileList|File[],fileId?:string) {
    if(busy) return;setBusy(true);setError('');
    const failures:string[]=[];
    for(const file of Array.from(incoming)) {
      try {
        const q=new URLSearchParams({name:file.name,classification:'outro',...(fileId?{fileId}:{})});
        const response=await fetch(`${base}?${q}`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});
        const value=await response.json();if(!response.ok) throw new Error(value.error);
      } catch(e) {failures.push(`${file.name}: ${(e as Error).message}`);}
    }
    try {await reload();} catch(e) {failures.push((e as Error).message);}
    setError(failures.join('\n'));setBusy(false);
  }
  async function edit(id:string,patch:unknown) {
    setBusy(true);setError('');try{await api(`${base}/${id}`,'PATCH',patch);await reload();}catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function open(file:ProjectFileVersion) {try{const {url}=await api<{url:string}>(`${base}/${file.id}`,'POST',{});setPreview({name:file.name,url});}catch(e){setError((e as Error).message);}}
  return <section className="space-y-5"><div><p className="eyebrow">Documentos do projeto</p><h2 className="page-title mt-2">{t.files}</h2><p className="mt-3 text-sm text-slate-500">Arquivos privados. Substituições criam novas versões e preservam o histórico. PDF, PNG e JPEG; até 20 MB por arquivo na configuração padrão.</p></div>
    {canEdit&&<label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files);}} className="surface-card block cursor-pointer rounded-2xl border-dashed p-8 text-center"><span>{busy?'Enviando…':t.drop}</span><input aria-label="Enviar documentos" className="mx-auto mt-4 block max-w-full text-sm" type="file" multiple accept="application/pdf,image/png,image/jpeg" disabled={busy} onChange={e=>{if(e.target.files) void upload(e.target.files);e.target.value='';}}/></label>}
    <p className="text-xs text-slate-500">DXF, DWG, IFC, RVT, SKP e GLB: exporte para PDF ou imagem nesta etapa.</p>
    {error&&<p role="alert" className="whitespace-pre-line rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading?<p>{t.loading}</p>:!files.length?<p>{t.empty}</p>:<div className="space-y-3">{files.map(f=><article key={f.id} className="surface-card rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h3 className="break-all font-semibold">{f.name} <span className="text-xs text-slate-500">v{f.version}</span></h3><p className="mt-1 text-xs text-slate-500">{f.mime} · {(f.size/1024).toFixed(1)} KB · {new Date(f.createdAt).toLocaleString('pt-BR')} · {f.author}</p><span className="mt-2 inline-block rounded-full bg-sage-soft px-3 py-1 text-xs">{fileStatusLabels[f.status]}</span></div><Button variant="outline" onClick={()=>open(f)}>{t.preview}</Button></div>
      <div className="mt-4 flex flex-wrap items-center gap-4"><label className="text-xs">Classificação<Select aria-label={`Classificação de ${f.name} v${f.version}`} disabled={!canEdit||busy} value={f.classification} onChange={e=>edit(f.id,{classification:e.target.value})}>{classifications.map(c=><option key={c}>{c}</option>)}</Select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!canEdit||busy||f.status==='archived'} checked={f.selected} onChange={e=>edit(f.id,{selected:e.target.checked})}/>{t.selected}</label>
      {canEdit&&<><label className="cursor-pointer text-sm underline">{t.replace}<input aria-label={`Substituir ${f.name} v${f.version}`} type="file" className="hidden" accept="application/pdf,image/png,image/jpeg" disabled={busy} onChange={e=>{if(e.target.files) void upload(e.target.files,f.fileId);e.target.value='';}}/></label><Button size="sm" variant="ghost" disabled={busy||f.status==='archived'} onClick={()=>edit(f.id,{archive:true})}>{t.archive}</Button></>}</div></article>)}</div>}
    <Dialog open={!!preview} onClose={()=>setPreview(null)} title={preview?.name??t.preview} wide><p className="px-6 py-3 text-xs text-slate-500">Acesso temporário. Se expirar, feche e abra novamente.</p>{preview&&<iframe title={preview.name} src={preview.url} className="h-[65vh] w-full"/>}</Dialog>
  </section>;
}
