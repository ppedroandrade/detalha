import { z } from 'zod';

export const projectStatuses = ['Coleta de arquivos', 'Processando documentos', 'Aguardando validação', 'Pronto para modelagem', 'Gerando 3D', 'Revisão do 3D', 'Publicado', 'Falha no processamento'] as const;
export const fileStatuses = ['uploaded', 'queued', 'processing', 'processed', 'needs_review', 'failed', 'archived'] as const;
export const classifications = ['planta', 'layout', 'corte', 'elevação', 'marcenaria', 'luminotécnico', 'acabamento', 'foto', 'memorial', 'outro'] as const;
export const idSchema = z.string().min(1).max(100);
const text = z.string().max(4000);
export const loginSchema = z.object({ email: z.email().transform(s => s.toLowerCase().trim()), password: z.string().min(1).max(128) }).strict();
export const registrationSchema = loginSchema.extend({ password: z.string().min(12).max(128), name: z.string().trim().min(1).max(120), organization: z.string().trim().min(1).max(120) }).strict();
export const clientSchema = z.object({ name: z.string().trim().min(1).max(120), email: z.email().transform(s => s.toLowerCase()), password: z.string().min(12).max(128), projectName: z.string().trim().min(1).max(160) }).strict();
export const citationSchema = z.object({ versionId: idSchema, page: z.number().int().positive(), excerpt: z.string().min(1).max(4000) }).strict();
export const factSchema = z.object({
  id: idSchema, kind: z.enum(['room', 'wall', 'opening', 'furniture', 'material', 'installation', 'document']),
  field: text, value: z.union([z.number().finite(), text, z.boolean()]), originalValue: text,
  originalUnit: z.enum(['m', 'cm', 'mm', 'm2', 'cm2', 'degree', 'none']), unit: z.enum(['m', 'm2', 'degree', 'none']),
  confidence: z.number().min(0).max(1), citations: z.array(citationSchema).min(1),
}).strict();
export const measureSchema = factSchema.refine(f => typeof f.value === 'number' && f.value > 0 && f.unit === 'm', 'Medida positiva em metros');
const point = z.object({ x: z.number().finite(), z: z.number().finite() }).strict();
const technical = z.object({ id: idSchema, factIds: z.array(idSchema).min(1) }).strict();
export const resultSchema = z.object({
  schemaVersion: z.literal('1'),
  documents: z.array(z.object({ versionId: idSchema, classification: z.enum(classifications), pageCount: z.number().int().positive().nullable() }).strict()),
  detectedUnits: z.array(z.enum(['m', 'cm', 'mm'])), orientation: z.number().min(0).max(360).nullable(),
  facts: z.array(factSchema),
  rooms: z.array(technical.extend({ name: text, area: z.number().positive().nullable(), height: z.number().positive().nullable() }).strict()),
  walls: z.array(technical.extend({ start: point, end: point, thickness: z.number().positive(), height: z.number().positive(), roomId: idSchema }).strict()),
  openings: z.array(technical.extend({ type: z.enum(['door', 'window']), wallId: idSchema, position: z.number().nonnegative(), width: z.number().positive(), height: z.number().positive(), sill: z.number().nonnegative().nullable(), direction: text.nullable() }).strict()),
  furniture: z.array(technical.extend({ roomId: idSchema, position: point, rotation: z.number().finite(), width: z.number().positive(), height: z.number().positive(), depth: z.number().positive() }).strict()),
  materials: z.array(technical.extend({ surface: text, description: text, color: text.nullable(), reference: text.nullable() }).strict()),
  installations: z.array(technical.extend({ type: z.enum(['electrical', 'plumbing']), roomId: idSchema, position: point, height: z.number().nonnegative().nullable() }).strict()),
  conflicts: z.array(z.object({ id: idSchema, description: text, critical: z.boolean(), factIds: z.array(idSchema).min(2) }).strict()),
  missingInformation: z.array(z.object({ id: idSchema, description: text, critical: z.boolean() }).strict()),
  assumptions: z.array(z.object({ id: idSchema, description: text, justification: z.string().min(1), accepted: z.literal(false) }).strict()),
  readiness: z.object({ structuralComplete: z.boolean(), readyForModeling: z.literal(false) }).strict(),
}).strict().superRefine((r, ctx) => {
  const facts = new Set(r.facts.map(f => f.id));
  const docs = new Set(r.documents.map(d => d.versionId));
  if (facts.size !== r.facts.length || docs.size !== r.documents.length) ctx.addIssue({ code: 'custom', message: 'Identificadores duplicados' });
  for (const f of r.facts) for (const c of f.citations) if (!docs.has(c.versionId)) ctx.addIssue({ code: 'custom', message: 'Citação fora dos documentos analisados' });
  for (const entity of [...r.rooms, ...r.walls, ...r.openings, ...r.furniture, ...r.materials, ...r.installations, ...r.conflicts]) {
    if (entity.factIds.some(id => !facts.has(id))) ctx.addIssue({ code: 'custom', message: 'Fato de origem ausente' });
  }
});
export type DocumentResult = z.infer<typeof resultSchema>;
export type ExtractedFact = z.infer<typeof factSchema>;
export type SourceCitation = z.infer<typeof citationSchema>;
export type ProjectState = typeof projectStatuses[number];
export type FileStatus = typeof fileStatuses[number];
export type Classification = typeof classifications[number];
export const environmentSchema = z.object({ id: idSchema, name: text, description: text, icon: z.enum(['kitchen','gourmet','laundry','bathroom','living','bedroom','home']), color: z.string().regex(/^#[0-9a-f]{6}$/i), createdAt: z.iso.datetime(), extractedRoomId: idSchema.optional() }).strict();
export const itemSchema = z.object({
  id: idSchema, environmentId: idSchema, name: text, category: text, brand: text, model: text, productCode: text, quantity: z.number().int().positive(), dimensions: text, voltage: text, finish: text,
  productUrl: z.string().max(2000).refine(s => !s || /^https?:\/\//.test(s)), manualUrl: z.string().max(2000).refine(s => !s || /^https?:\/\//.test(s)),
  notes: text, status: z.enum(['A definir','Escolhido','Comprado','Entregue','Instalado']), imageUrl: z.string().max(2_000_000).refine(s => !s || /^https?:\/\//.test(s) || /^data:image\/(png|jpeg|webp);base64,/.test(s)),
  favorite: z.boolean(), carpentryPending: text, needsElectrical: z.boolean(), needsPlumbing: z.boolean(), needsCutout: z.boolean(), createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
  structuredDimensions: z.object({ width: measureSchema.optional(), height: measureSchema.optional(), depth: measureSchema.optional() }).strict().optional(), sceneObjectId: idSchema.optional(),
}).strict();
export const appDataSchema = z.object({ environments: z.array(environmentSchema).max(500), items: z.array(itemSchema).max(5000) }).strict().superRefine((v, ctx) => {
  const ids = new Set(v.environments.map(e => e.id));
  if (ids.size !== v.environments.length || new Set(v.items.map(i => i.id)).size !== v.items.length || v.items.some(i => !ids.has(i.environmentId))) ctx.addIssue({ code: 'custom', message: 'Relacionamentos inválidos' });
});
