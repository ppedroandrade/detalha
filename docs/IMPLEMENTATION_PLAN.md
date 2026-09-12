# Plano de implementação

O detalhamento funcional e os critérios completos estão em `docs/PROMPT_MESTRE_IA_3D.md`. Marque uma tarefa somente quando houver implementação e verificação correspondentes.

## Fase 0 — Baseline e arquitetura

- [x] Criar prompt mestre do produto.
- [x] Criar protocolo de continuidade entre agentes.
- [x] Criar orquestrador local inicial.
- [ ] Executar e registrar `npm ci`, lint e build do estado atual.
- [ ] Mapear rotas, componentes, tipos e persistência existentes.
- [ ] Definir banco, autenticação, armazenamento e execução assíncrona em uma decisão registrada.
- [ ] Criar `.env.example` sem credenciais.

## Fase 1 — Fundação persistente

- [ ] Adicionar organizações, usuários, clientes e projetos persistentes.
- [ ] Implementar autenticação real e autorização por organização/projeto.
- [ ] Manter modo demonstrativo separado e identificável.
- [ ] Criar migrações e dados mínimos de desenvolvimento.
- [ ] Cobrir isolamento entre organizações com testes.

## Fase 2 — Arquivos de projeto

- [ ] Implementar upload múltiplo de PDF, PNG e JPEG.
- [ ] Armazenar arquivos de forma privada com URL temporária.
- [ ] Adicionar versão, tipo, hash, páginas e estado de processamento.
- [ ] Criar tela de arquivos, progresso, falhas e reprocessamento.
- [ ] Validar tipo, tamanho, autorização e duplicidade.

## Fase 3 — Leitura assistida por IA

- [ ] Criar interfaces para OCR, visão e modelo estruturado.
- [ ] Implementar provedor mock determinístico.
- [ ] Definir schemas Zod para fatos, ambientes, paredes, aberturas, móveis e materiais.
- [ ] Manter fonte, página, confiança e evidência para cada fato.
- [ ] Detectar dados ausentes, ambíguos e contraditórios.
- [ ] Implementar fila, retentativas, idempotência e registro de custo.

## Fase 4 — Revisão e aprovação humana

- [ ] Criar revisão por ambiente e categoria.
- [ ] Exibir documento e evidência ao lado do dado extraído.
- [ ] Permitir corrigir, rejeitar e aprovar fatos.
- [ ] Bloquear geração 3D enquanto existirem conflitos críticos.
- [ ] Versionar aprovações, correções e auditoria.

## Fase 5 — Motor 3D determinístico

- [ ] Definir schema de cena em metros independente do renderizador.
- [ ] Gerar paredes, pisos, teto, portas e janelas a partir de dados aprovados.
- [ ] Adicionar mobiliário paramétrico e modelos GLB permitidos.
- [ ] Implementar materiais neutros explicitamente sinalizados quando faltarem acabamentos.
- [ ] Implementar colisões, câmera a 1,60 m e passagem por todas as portas.
- [ ] Adicionar visão superior e seleção de ambiente.

## Fase 6 — Tour e experiência do cliente

- [ ] Implementar WASD/setas, mouse/arraste e controles por toque.
- [ ] Criar menu de teleporte por ambiente.
- [ ] Criar tour guiado editável.
- [ ] Permitir interação somente com objetos autorizados.
- [ ] Criar compartilhamento revogável e protegido.
- [ ] Validar Safari/iPad e perfis de qualidade gráfica.

## Fase 7 — Operação e qualidade

- [ ] Adicionar observabilidade, auditoria e painel de custos.
- [ ] Definir limites por organização e por projeto.
- [ ] Cobrir fluxos críticos com testes de integração e ponta a ponta.
- [ ] Documentar backup, retenção, exclusão e recuperação.
- [ ] Fazer revisão de segurança e desempenho antes da produção.

## Critério para conclusão

O marcador `COMPLETE` só pode ser usado quando todas as tarefas estiverem marcadas, os critérios do prompt mestre forem atendidos e lint, typecheck, testes e build passarem.
