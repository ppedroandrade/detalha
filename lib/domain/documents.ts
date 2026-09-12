import type { Classification, FileStatus } from './schemas';
import { DomainError } from './rules';
export interface ProjectFileVersion {
  id:string; fileId:string; projectId:string; version:number; name:string; mime:string; size:number;
  hash:string; author:string; status:FileStatus; selected:boolean; classification:Classification; createdAt:string;
}
export const supportedFormats = [
  {extension:'pdf',supported:true},{extension:'png',supported:true},{extension:'jpg',supported:true},
  ...['dxf','dwg','ifc','rvt','skp','glb'].map(extension=>({extension,supported:false})),
];
export function validateFile(name:string,mime:string,bytes:Buffer,max:number) {
  if(!name.trim() || name.length>200 || /[\x00-\x1f/\\]/.test(name)) throw new DomainError('Nome de arquivo inválido.');
  if(!bytes.length || bytes.length>max) throw new DomainError('Arquivo vazio ou acima do limite.',413);
  const ext=name.toLowerCase().split('.').at(-1);
  const pdf=bytes.subarray(0,5).toString()==='%PDF-';
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const valid=(mime==='application/pdf'&&ext==='pdf'&&pdf)||(mime==='image/png'&&ext==='png'&&png)||(mime==='image/jpeg'&&['jpg','jpeg'].includes(ext??'')&&jpg);
  if(!valid) throw new DomainError('Envie PDF, PNG ou JPEG com conteúdo compatível. Outros formatos exigem exportação prévia.',415);
}
