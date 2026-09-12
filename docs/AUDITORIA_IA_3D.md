# Fase 0 — auditoria (12/09/2026)

Fonte de verdade: `docs/PROMPT_MESTRE_IA_3D.md`, lido integralmente.
Branch: `feature/ia-documentos-tour-3d`.

## Mapa e fluxos

- `app/`: página única com App Router, layout, fontes e estilos; sem backend.
- `components/platform-app.tsx` seleciona login, painel e projeto.
- `admin-dashboard` e `client-form`: cadastro, bloqueio, status e abertura do projeto.
- `apartment-app`: visão geral, ambientes, itens, filtros, duplicação, favoritos e equipe.
- `environment-form`, `item-form`, `ui/`: edição e componentes reutilizáveis.
- `hooks/`: estado React; `lib/storage.ts`: dados e sessão no navegador.
- `lib/types.ts`: contratos; `seed.ts`: exemplos; `export-excel.ts`: exportação XLSX; `utils.ts`: estilos e IDs.
- Configurações: TypeScript estrito, Tailwind, ESLint, Next 15.5.19 no lockfile / React 19.
- `docs/requisitos-plataforma-marcenaria.md`: contexto anterior, subordinado ao prompt mestre.
- `ap1806-tour/`: diretório não rastreado, excluído do Git, lint e tipos; nenhum conteúdo será importado.

## Evidência inicial

- ESLint no código rastreado: passou; `npm run lint` falhou por analisar JavaScript de terceiro no diretório privado não rastreado (23 erros). Corrigida a abrangência, sem modificar o diretório.
- `npx tsc --noEmit`: passou.
- `npm run build`: passou; apenas `/` e página 404.
- Não existiam runner, scripts ou testes automatizados.

## Problemas e decisões

1. Autenticação demonstrativa comparava senhas em texto; nenhuma autorização no servidor. Separar `/demo` e modo persistente, remover credenciais do contrato público, usar Supabase Auth em produção e scrypt/sessões opacas no desenvolvimento local.
2. Seed continha nomes e observações pessoais. Substituir por dados fictícios neutros; não apagar armazenamento já existente.
3. Nenhuma persistência multiusuário, upload privado, processamento, evidência, revisão ou 3D.
4. Usar PostgreSQL em produção e PGlite (PostgreSQL embarcado em disco) local, com migrações SQL compartilhadas e transações. Local é explicitamente desenvolvimento, nunca fallback silencioso de produção.
5. Isolar domínio Zod, repositório SQL, autenticação, storage, providers e worker. Reutilizar telas e manter o adaptador local de demonstração.
6. Arquivos imutáveis por versão, hash e metadados; download autenticado e URL temporária; Supabase Storage privado em produção, filesystem fora de `public/` local.
7. Fila persistida com lease e retomada; mock não deduz geometria de arquivos arbitrários. Ausência de medidas é pendência, nunca valor estimado.
8. Estrutura final: User → OrganizationMember → Organization; Client → Project → Environment/ApartmentItem e ProjectFile → ProjectFileVersion; ProcessingRun → ProcessingPage/ExtractedFact/SourceCitation e entidades técnicas explícitas; ValidationDecision preserva original; SceneVersion/SceneObject e TourShare nas fases seguintes; AuditLog transversal. Detalhes e limites serão mantidos no documento de arquitetura.

Riscos: serviços externos ainda não verificados; recuperação de conta, revisão completa e tour pertencem às próximas etapas. O código local existente deve continuar útil durante a migração.
