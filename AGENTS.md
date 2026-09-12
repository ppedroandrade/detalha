# Instruções compartilhadas para agentes

Este repositório é o **Detalha**, uma plataforma para centralizar especificações de projetos de interiores e, progressivamente, transformar documentos técnicos validados em experiências 3D navegáveis.

## Leitura obrigatória

Antes de alterar código, leia nesta ordem:

1. `docs/PROMPT_MESTRE_IA_3D.md` — objetivo, regras e arquitetura desejada;
2. `docs/IMPLEMENTATION_PLAN.md` — fases e tarefas pendentes;
3. `docs/AI_HANDOFF.md` — estado deixado pelo agente anterior;
4. `docs/DECISIONS.md` — decisões que não devem ser rediscutidas sem evidência nova.

Em seguida, execute `git status`, `git diff` e `git log -10 --oneline`. Inspecione o código relacionado antes de propor ou implementar mudanças.

## Regras do produto

- Os arquivos fornecidos pelo cliente são a única fonte de verdade para medidas, geometria, mobiliário e acabamentos.
- Nunca invente uma medida. Registre lacunas, ambiguidades e contradições para validação humana.
- Toda informação extraída deve manter referência ao arquivo e à página de origem, além de confiança e estado de validação.
- A cena 3D só pode ser gerada a partir de dados aprovados. A geometria deve ser determinística e trabalhar em escala 1:1 em metros.
- Dados do repositório privado `ppedroandrade/ap1806-tour` podem servir como referência técnica somente quando o agente tiver acesso autorizado. Não copie plantas, medidas, imagens ou dados pessoais para este repositório público.
- Preserve o modo de demonstração atual até existir uma migração persistente testada.

## Forma de trabalhar

- Continue a primeira tarefa desmarcada de `docs/IMPLEMENTATION_PLAN.md` que não esteja bloqueada.
- Faça mudanças pequenas, coesas e revisáveis.
- Não desfaça alterações do usuário ou de outro agente.
- Atualize testes quando uma mudança de comportamento justificar isso.
- Execute os checks relevantes e registre o resultado em `docs/AI_HANDOFF.md`.
- Atualize o plano e o registro de decisões quando o trabalho mudar o estado do projeto.
- Faça commit somente dos arquivos relacionados ao trabalho concluído.

## Limites de autonomia

- Não execute `git push`, merge, deploy ou publicação automaticamente.
- Não altere segredos, cobrança, produção ou dados reais de clientes.
- Não use comandos destrutivos nem ignore falhas de testes.
- Pare quando faltar uma decisão humana, credencial ou autorização que altere materialmente o resultado.

## Protocolo de revezamento

Antes de encerrar uma execução:

1. deixe o working tree compreensível e, quando seguro, faça um commit de checkpoint;
2. atualize `docs/AI_HANDOFF.md` com resumo, arquivos, testes, pendências e próxima ação;
3. marque as tarefas realmente concluídas em `docs/IMPLEMENTATION_PLAN.md`;
4. termine a resposta com exatamente um marcador:

```text
<AI_STATUS>CONTINUE</AI_STATUS>
<AI_STATUS>COMPLETE</AI_STATUS>
<AI_STATUS>BLOCKED</AI_STATUS>
```

Use `CONTINUE` quando outro agente puder prosseguir, `COMPLETE` somente quando todo o plano estiver implementado e validado, e `BLOCKED` quando for necessária intervenção humana.
