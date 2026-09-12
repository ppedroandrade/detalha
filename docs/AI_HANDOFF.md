# Handoff entre agentes

Atualize este arquivo ao final de cada ciclo. Registre fatos verificáveis e mantenha somente o estado necessário para o próximo agente continuar.

## Estado atual

- Status: pronto para iniciar a implementação da fundação.
- Repositório: `ppedroandrade/detalha`.
- Produto atual: demonstração Next.js com dados e autenticação mantidos no navegador por `localStorage`.
- Produto desejado: gestão de projetos, upload privado, leitura assistida por IA, validação humana e geração de tour 3D navegável.

## Concluído

- Prompt mestre do produto criado em `docs/PROMPT_MESTRE_IA_3D.md`.
- Protocolo compartilhado para Codex/Astra e Claude/Opus definido.
- Plano inicial e registro de decisões adicionados.
- Orquestrador local e tarefas do VS Code preparados para revezamento sequencial.

## Próxima ação recomendada

1. Confirmar o baseline executando `npm ci`, `npm run lint` e `npm run build`.
2. Auditar a arquitetura atual e registrar os limites do modo demonstrativo.
3. Escolher e documentar banco, autenticação e armazenamento privado.
4. Implementar a Fase 1 sem remover o funcionamento demonstrativo existente.

## Bloqueios conhecidos

- Credenciais de banco, armazenamento e provedores de IA ainda não foram configuradas.
- O acesso ao repositório privado `ap1806-tour` é opcional nesta fase e não deve bloquear a fundação.

## Último ciclo

- Agente: configuração inicial.
- Alterações: documentação de continuidade, script do orquestrador e integração com npm/VS Code.
- Testes: validação sintática do script com `node --check scripts/ai-orchestrator.mjs`.
- Próximo agente: iniciar pelo baseline e pela primeira tarefa desmarcada do plano.
