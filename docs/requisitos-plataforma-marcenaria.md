# Plataforma de especificações para marcenaria

## Resumo da proposta

A plataforma substitui as planilhas enviadas aos clientes para coleta de eletrodomésticos, metais, cubas, equipamentos e demais itens que interferem no projeto dos móveis planejados.

Cada cliente recebe um acesso individual para preencher seu apartamento. A marcenaria acompanha todos os projetos em um painel administrativo, revisa medidas e manuais e exporta os dados para Excel quando necessário.

## Problema que o produto resolve

- Planilhas são difíceis de preencher pelo celular.
- Links, imagens e manuais ficam espalhados em conversas.
- Existem versões diferentes do mesmo arquivo.
- Informações importantes para nichos, recortes e pontos técnicos ficam incompletas.
- A equipe precisa cobrar o cliente manualmente para saber o que falta.
- O histórico das alterações não fica organizado por projeto.

## Perfis de acesso

### Administrador da marcenaria

- Cadastrar clientes.
- Criar e acessar projetos.
- Bloquear ou liberar o acesso de clientes.
- Visualizar e editar qualquer projeto.
- Acompanhar o status do preenchimento.
- Alterar o status do projeto.
- Exportar as especificações para Excel.
- Criar usuários internos da equipe.
- Definir quais colaboradores podem acessar cada projeto.

### Colaborador da marcenaria

- Acessar somente os projetos autorizados.
- Consultar especificações para desenho, produção ou montagem.
- Adicionar pendências e comentários.
- Aprovar ou solicitar correção de informações.
- Não cadastrar usuários ou alterar configurações comerciais.

### Cliente

- Acessar somente os próprios projetos.
- Cadastrar e editar ambientes.
- Cadastrar eletros e demais itens.
- Inserir medidas, marca, modelo, código, imagens, links e manuais.
- Informar necessidades elétricas, hidráulicas e de recorte.
- Acompanhar itens pendentes.
- Marcar decisões e compras por status.
- Exportar ou visualizar o resumo do próprio projeto.

## Fluxo principal

1. A marcenaria cadastra o cliente e o nome do projeto.
2. O sistema envia um convite por e-mail ou WhatsApp.
3. O cliente cria ou recebe uma senha.
4. O projeto é iniciado com ambientes definidos pela marcenaria.
5. O cliente preenche os itens e documentos.
6. O sistema mostra campos obrigatórios e percentual preenchido.
7. A equipe revisa as informações e registra pendências.
8. O cliente corrige ou complementa os itens solicitados.
9. A marcenaria aprova as especificações.
10. O projeto é bloqueado para alterações ou versionado.
11. A equipe consulta os dados durante projeto, produção e montagem.

## Requisitos funcionais do MVP comercial

### Autenticação e segurança

- Login por e-mail e senha.
- Recuperação de senha.
- Senhas armazenadas com hash, nunca em texto aberto.
- Sessões seguras e expiração de acesso.
- Controle de acesso por empresa, usuário e projeto.
- Registro de último acesso.
- Aceite de termos e política de privacidade.

### Gestão da marcenaria

- Cadastro da empresa, logotipo e dados de contato.
- Cadastro de administradores e colaboradores.
- Cadastro de clientes.
- Criação de projetos por cliente.
- Um cliente pode possuir mais de um projeto.
- Definição de responsáveis internos por projeto.
- Status: convite enviado, coleta, revisão, aprovado, concluído e arquivado.
- Pesquisa e filtros por cliente, responsável, status e prazo.

### Templates de projeto

- Modelos de ambientes reutilizáveis.
- Modelos diferentes para apartamento, casa, cozinha e área gourmet.
- Lista sugerida de itens por ambiente.
- Campos obrigatórios configuráveis.
- Duplicação de um projeto ou template.

### Coleta de especificações

- Todos os campos existentes no protótipo.
- Upload real de imagens e arquivos PDF.
- Links de produto e manual.
- Validação de URL, quantidade e medidas.
- Indicação visual de dados incompletos.
- Comentários entre cliente e marcenaria.
- Pendência atribuída ao cliente ou à equipe.
- Aprovação individual de cada item.
- Histórico de alterações.

### Comunicação

- Envio de convite.
- Lembretes automáticos de preenchimento.
- Aviso quando um item é alterado.
- Aviso quando a marcenaria cria uma pendência.
- Resumo semanal opcional.
- Compartilhamento por link protegido.

### Relatórios

- Visualização técnica por ambiente.
- Exportação Excel.
- Relatório PDF com identidade da marcenaria.
- Impressão organizada.
- Lista somente de pendências.
- Lista de pontos elétricos e hidráulicos.
- Lista de nichos, recortes e medidas.

## Requisitos não funcionais

- Interface responsiva para celular, tablet e computador.
- Isolamento completo dos dados de cada empresa e cliente.
- Backup automático.
- Criptografia em trânsito e em repouso.
- Adequação à LGPD.
- Disponibilidade mínima definida em contrato.
- Logs de auditoria.
- Monitoramento de erros.
- Exportação e exclusão dos dados do cliente.
- Limites de armazenamento por plano.
- Bom desempenho com centenas de clientes e milhares de itens.

## Modelo de dados recomendado

- Empresas.
- Usuários.
- Perfis e permissões.
- Clientes.
- Projetos.
- Participantes do projeto.
- Ambientes.
- Itens.
- Imagens e arquivos.
- Comentários.
- Pendências.
- Aprovações.
- Histórico de alterações.
- Convites.
- Notificações.
- Templates.

## O que o protótipo atual já demonstra

- Login de cliente e administrador.
- Separação visual entre painel administrativo e projeto do cliente.
- Cadastro local de clientes e projetos.
- Acesso do administrador ao apartamento demonstrativo.
- Bloqueio e liberação de usuários.
- Status do projeto.
- Cadastro de ambientes e itens.
- Dados fictícios de demonstração.
- Visualização técnica para a equipe.
- Exportação Excel.
- Layout responsivo.

## Limitações do protótipo

O protótipo usa `localStorage`. Portanto:

- Os dados existem somente no navegador usado.
- As credenciais são apenas demonstrativas.
- Não existe segurança real entre usuários.
- Não existe sincronização entre dispositivos.
- Uploads ficam limitados pelo armazenamento do navegador.
- Não há recuperação de senha, e-mail, backup ou auditoria.

Essas limitações precisam ser removidas antes de disponibilizar o produto para clientes reais.

## Arquitetura sugerida para produção

- Frontend: Next.js, React, TypeScript e Tailwind CSS.
- Backend e banco: Supabase/PostgreSQL.
- Autenticação: Supabase Auth.
- Arquivos: Supabase Storage ou serviço equivalente.
- E-mails: Resend.
- Hospedagem: Vercel.
- Monitoramento: Sentry.
- Pagamentos, se for SaaS: Stripe ou Mercado Pago.

O banco deve aplicar políticas de segurança por empresa e projeto, impedindo que um cliente consulte dados de outro cliente mesmo que tente acessar diretamente a API.

## Fases recomendadas

### Fase 1 — MVP piloto

- Backend real.
- Login seguro.
- Empresas, usuários, clientes e projetos.
- Cadastro de ambientes e itens.
- Imagens e manuais.
- Painel administrativo.
- Excel e PDF.
- Convites e recuperação de senha.
- Aplicação da identidade visual da marcenaria piloto.

### Fase 2 — Operação

- Comentários e pendências.
- Aprovação por item.
- Histórico de alterações.
- Templates de projeto.
- Lembretes.
- Dashboard de preenchimento.
- Colaboradores e permissões.

### Fase 3 — Produto SaaS

- Múltiplas marcenarias.
- Planos e cobrança.
- Personalização de marca por empresa.
- Métricas de uso.
- Integrações com CRM, ERP ou software de projetos.
- Aplicativo instalável/PWA.

## Perguntas para validar com a marcenaria

1. Quem cria os ambientes: a marcenaria ou o cliente?
2. Quais campos são obrigatórios antes de iniciar o projeto executivo?
3. A equipe precisa aprovar cada item?
4. O cliente pode alterar um item depois de aprovado?
5. Quais colaboradores podem acessar cada projeto?
6. A marcenaria precisa de PDF além do Excel?
7. Quais relatórios são usados na produção e na montagem?
8. Como os clientes recebem lembretes atualmente?
9. A marcenaria quer usar sua própria marca e domínio?
10. Quantos projetos e usuários ativos existem por mês?
11. Há necessidade de importar planilhas antigas?
12. Por quanto tempo os arquivos precisam ser guardados?

## Texto curto para apresentação

Hoje a coleta de eletros e especificações é feita por planilha, o que gera informações incompletas, arquivos duplicados e retrabalho. A proposta é fornecer a cada cliente um portal próprio para cadastrar produtos, medidas, imagens e manuais. A marcenaria acompanha todos os projetos em um painel único, identifica pendências e consulta os dados técnicos por ambiente. O objetivo é reduzir cobranças manuais, erros de recorte e perda de informações entre atendimento, projeto, produção e montagem.
