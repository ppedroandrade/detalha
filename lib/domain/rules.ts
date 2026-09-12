import type { ProjectState } from './schemas';
export class DomainError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function meters(value: number, unit: 'm' | 'cm' | 'mm') {
  if (!Number.isFinite(value) || value <= 0) throw new DomainError('Medida inválida');
  return value / ({ m: 1, cm: 100, mm: 1000 }[unit]);
}
const transitions: Record<ProjectState, ProjectState[]> = {
  'Coleta de arquivos': ['Processando documentos'], 'Processando documentos': ['Aguardando validação', 'Falha no processamento'],
  'Aguardando validação': ['Processando documentos', 'Pronto para modelagem'], 'Pronto para modelagem': ['Processando documentos', 'Gerando 3D'],
  'Gerando 3D': ['Revisão do 3D', 'Falha no processamento'], 'Revisão do 3D': ['Publicado', 'Processando documentos'],
  'Publicado': ['Processando documentos'], 'Falha no processamento': ['Processando documentos'],
};
export function transition(from: ProjectState, to: ProjectState, readiness = { structuralComplete: false, unapprovedDimensions: 1, criticalConflicts: 1, unacceptedAssumptions: 1 }) {
  if (!transitions[from].includes(to)) throw new DomainError('Transição de projeto não permitida', 409);
  if (to === 'Pronto para modelagem' && (!readiness.structuralComplete || readiness.unapprovedDimensions || readiness.criticalConflicts || readiness.unacceptedAssumptions)) throw new DomainError('Validação estrutural incompleta', 409);
  return to;
}
