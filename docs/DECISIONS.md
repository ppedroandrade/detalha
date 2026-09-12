# Registro de decisões

Este arquivo guarda decisões duráveis do projeto. Adicione uma nova entrada quando uma escolha afetar arquitetura, dados, segurança ou fluxo de trabalho.

## D-001 — O repositório é a memória compartilhada

- Estado: aceita.
- Decisão: Codex/Astra e Claude/Opus compartilham contexto por instruções versionadas, plano, handoff, decisões, commits e testes.
- Motivo: sessões e modelos não compartilham memória integral de forma nativa.

## D-002 — Um agente por vez

- Estado: aceita.
- Decisão: o orquestrador executa agentes sequencialmente na mesma branch.
- Motivo: evitar edições concorrentes, sobrescritas e decisões incompatíveis.

## D-003 — Branch automática de trabalho

- Estado: aceita.
- Decisão: ao iniciar em `main` ou `master` com working tree limpo, o orquestrador cria uma branch `ai/orchestrator-<data>`.
- Motivo: preservar a branch principal e facilitar revisão.

## D-004 — Sem publicação automática

- Estado: aceita.
- Decisão: agentes não podem fazer push, merge, deploy ou publicar artefatos sem ação humana.
- Motivo: manter uma fronteira clara para ações externas e irreversíveis.

## D-005 — Validação antes do 3D

- Estado: aceita.
- Decisão: medidas extraídas nunca são tratadas como verdade silenciosamente; a cena 3D utiliza apenas dados validados.
- Motivo: fidelidade arquitetônica e rastreabilidade são requisitos centrais do produto.

## D-006 — Provedores substituíveis

- Estado: aceita.
- Decisão: OCR, visão, LLM, armazenamento e fila devem ficar atrás de interfaces próprias.
- Motivo: permitir mocks locais, controlar custos e trocar fornecedores sem reescrever o domínio.
