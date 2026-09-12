# Detalha

Portal de especificações e documentos para arquitetura e marcenaria. Fonte de verdade: [prompt mestre](docs/PROMPT_MESTRE_IA_3D.md). [Auditoria inicial](docs/AUDITORIA_IA_3D.md).

## Desenvolvimento sem credenciais

Node 22+ e npm. `npm ci`, copie `.env.example` para `.env.local`, execute `npm run dev`. Abra `http://localhost:3000`, crie uma conta local e uma organização. Depois cadastre um cliente e abra seu projeto. Nenhuma conta real ou senha padrão é inserida no banco.

`DETALHA_MODE=local` mantém PostgreSQL embarcado (PGlite) e arquivos privados em `.detalha/`, fora do Git e de `public/`. Um único processo deve abrir cada diretório local; pare o servidor antes de rodar scripts de banco no mesmo diretório. Reiniciar o servidor preserva os dados. Não use este adaptador em hospedagem distribuída ou com disco efêmero.

`/demo` preserva a demonstração no navegador, com exemplos fictícios. Credenciais demonstrativas: `admin@example.invalid` / `admin123` e `cliente@example.invalid` / `demo123`. Contas legadas locais são convertidas para hash sem remover seus projetos. Dados legados não são importados automaticamente no banco.

## Produção

Defina `DETALHA_MODE=production`, `DATABASE_URL`, `APP_URL` HTTPS, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `STORAGE_BUCKET`. Não configure segredos com prefixo `NEXT_PUBLIC_`.

1. Em banco dedicado, execute `npm run db:migrate` com credencial de migração autorizada a criar tabelas e o papel `detalha_app`. Os scripts CLI precisam das variáveis exportadas no shell (ou `node --env-file=.env.local --import tsx scripts/migrate.ts`).
2. A conexão SQL do servidor deve poder assumir `detalha_app`. Toda operação de domínio usa transação com `SET LOCAL ROLE detalha_app` e identidade verificada; RLS impede acesso cruzado. Autenticação, provisionamento e worker usam conexão privilegiada exclusivamente no servidor. Nunca disponibilize essa conexão ao navegador.
3. Crie identidades administrativas no Supabase Auth e execute `npm run provision -- <user-id> "Organização"`. O script verifica a identidade no provedor. Clientes são criados pelo administrador no portal; senha inicial mínima de 12 caracteres.
4. Crie bucket **privado** com o nome de `STORAGE_BUCKET`, MIME PDF/PNG/JPEG e limite compatível com `MAX_FILE_BYTES`. Não crie políticas públicas para objetos. O backend acessa o bucket com service role após autorização SQL.
5. Login usa [Supabase Auth](https://supabase.com/docs/guides/auth/passwords), seguido de sessão opaca de 8 horas no banco e cookie HttpOnly/Secure/SameSite. Bloquear cliente revoga suas sessões. Recuperação de senha e gestão de convites ainda dependem do painel/provedor; não há tela de recuperação implementada.
6. Storage segue o [modelo de acesso privado do Supabase](https://supabase.com/docs/guides/storage/security/access-control). Serviços externos exigem validação em staging com credenciais reais antes de disponibilizar a clientes.

Não existe fallback de produção para autenticação local, banco local ou IA mock. Falta de configuração é erro explícito.

## Verificação

`npm run check`: lint, typecheck, testes e build. Testes de integração usam bancos temporários reais PGlite e RLS; não acessam dados do usuário.

Migrações `db/migrations/*.up.sql` são versionadas e transacionais; cada uma possui `.down.sql`. Downgrade elimina dados da fase revertida: faça backup e execute somente após decisão operacional explícita. Nunca há downgrade automático.

## Limitações desta entrega

O adaptador local não substitui a validação de PostgreSQL/Supabase hospedados. O repositório não contém credenciais externas. Documentação das próximas etapas e resultados das verificações: `docs/ENTREGA_IA_3D.md`.
