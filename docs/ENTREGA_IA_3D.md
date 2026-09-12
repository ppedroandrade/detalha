# Entrega incremental — IA documental e tour 3D

## Fase 0

Implementado: auditoria integral da especificação, mapa dos fluxos, baseline, branch, isolamento do diretório privado e comandos de verificação. Commit `1ca9615`.

Arquivos: `docs/AUDITORIA_IA_3D.md`, `.gitignore`, `eslint.config.mjs`, `tsconfig.json`, `package*.json`, `tests/demo.test.ts`.

Verificação: lint, typecheck, teste da demonstração e build passaram. O lint inicial falhava somente por percorrer o diretório privado; corrigida a abrangência.

## Fase 1

Implementado: domínio Zod estrito, estados e regra de transição; PostgreSQL/PGlite, migrações reversíveis, RLS, clientes, organizações, projetos, ambientes e itens; autenticação gerenciada em produção e scrypt local; sessões revogáveis; storage privado local/Supabase; auditoria e controle de revisão concorrente. Telas existentes usam API no modo persistente; `/demo` mantém o navegador. Seed neutralizado; senhas demonstrativas legadas convertidas para hash ao carregar.

Arquivos: `lib/domain/*`, `lib/server/{config,database,auth,repository,http,storage}.ts`, `db/migrations/001*`, `app/api/{auth,clients,platform,projects}`, `app/{page,demo/page}.tsx`, `components/persistent-platform.tsx`, componentes e hooks existentes, `lib/{types,seed,storage,demo-password,api-client}.ts`, `.env.example`, `scripts/{migrate,provision}.ts`, `README.md`, `tests/foundation.test.ts`.

Decisões: SQL compartilhado entre banco local e produção; transações com papel restrito e identidade do cookie; armazenamento de dados dos itens em JSONB validado dentro de tabelas relacionais por projeto/ambiente; atualização por revisão otimista; nenhum dado demonstrativo enviado ao banco.

Verificação: lint e typecheck passaram; 3 testes passaram, incluindo RLS entre organizações/clientes, senha inválida, cookie forjado, bloqueio, revisão concorrente, reabertura do banco, unidades e bloqueio de modelagem. Build de produção passou com Next 15.5.25.

Pendências/riscos: Supabase/PostgreSQL remoto não executados sem credenciais; recuperação de senha e convites ainda pelo provedor; adaptador local exige um processo por diretório. Sessões da aplicação expiram em 8h; desativação externa da identidade não revoga automaticamente essas sessões (bloqueio no portal revoga). Alertas npm restantes em PostCSS transitivo e XLSX legado; não foi feita migração maior de Next. Tela de edição mantém trabalho em memória e avisa se houver falha de persistência; em conflito deve-se preservar alterações antes de recarregar.

Próxima etapa: upload privado, versões e classificação (Fase 2), seguido de fila e leitura mock com evidências (início da Fase 3). Revisão completa e 3D ainda não estão implementados.
