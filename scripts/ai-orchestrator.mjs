#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  open,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const runtimeDir = path.join(repoRoot, ".ai-orchestrator");
const statePath = path.join(runtimeDir, "state.json");
const lockPath = path.join(runtimeDir, "lock");
const logsDir = path.join(runtimeDir, "logs");

const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const reset = args.has("--reset");

function positiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} deve ser um número inteiro maior que zero.`);
  }
  return value;
}

const maxCycles = positiveInteger("AI_MAX_CYCLES", 6);
const maxTurns = positiveInteger("AI_MAX_TURNS", 80);
const timeoutMinutes = positiveInteger("AI_AGENT_TIMEOUT_MINUTES", 120);
const codexBin = process.env.CODEX_BIN || "codex";
const claudeBin = process.env.CLAUDE_BIN || "claude";
const codexModel = process.env.AI_CODEX_MODEL || "gpt-6-astra";
const claudeModel = process.env.AI_CLAUDE_MODEL || "opus";

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/PROMPT_MESTRE_IA_3D.md",
  "docs/IMPLEMENTATION_PLAN.md",
  "docs/AI_HANDOFF.md",
  "docs/DECISIONS.md",
];

function runSync(command, commandArgs) {
  return spawnSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
}

function git(commandArgs, { allowFailure = false } = {}) {
  const result = runSync("git", commandArgs);
  if (!allowFailure && result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${commandArgs.join(" ")} falhou.`);
  }
  return result;
}

async function fileExists(relativePath) {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

function commandVersion(command) {
  const result = runSync(command, ["--version"]);
  if (result.error?.code === "ENOENT" || result.status !== 0) {
    return null;
  }
  return (result.stdout || result.stderr).trim();
}

async function inspectEnvironment() {
  const gitCheck = git(["rev-parse", "--show-toplevel"], { allowFailure: true });
  if (gitCheck.status !== 0) {
    throw new Error("Execute este comando na raiz de um repositório Git.");
  }

  const missingFiles = [];
  for (const file of requiredFiles) {
    if (!(await fileExists(file))) missingFiles.push(file);
  }
  if (missingFiles.length > 0) {
    throw new Error(`Arquivos obrigatórios ausentes: ${missingFiles.join(", ")}`);
  }

  const codexVersion = commandVersion(codexBin);
  const claudeVersion = commandVersion(claudeBin);
  const branch = git(["branch", "--show-current"]).stdout.trim();
  const dirty = git(["status", "--porcelain"]).stdout.trim().length > 0;

  console.log(`Codex: ${codexVersion || "não encontrado"}`);
  console.log(`Claude: ${claudeVersion || "não encontrado"}`);
  console.log(`Branch: ${branch || "detached HEAD"}`);
  console.log(`Working tree: ${dirty ? "com alterações" : "limpa"}`);

  if (!codexVersion || !claudeVersion) {
    throw new Error(
      "Instale e autentique os CLIs codex e claude antes de iniciar o revezamento.",
    );
  }

  return { branch, dirty };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function newState() {
  const now = new Date().toISOString();
  return {
    version: 1,
    status: "idle",
    cycle: 0,
    nextAgent: "codex",
    lastAgent: null,
    lastExitCode: null,
    lastMarker: null,
    branch: null,
    startedAt: now,
    updatedAt: now,
  };
}

async function loadState() {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return newState();
    throw error;
  }
}

async function saveState(state) {
  state.updatedAt = new Date().toISOString();
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function createWorkBranch(currentBranch) {
  if (!currentBranch) {
    throw new Error("Não é possível iniciar em detached HEAD.");
  }
  if (!["main", "master"].includes(currentBranch)) return currentBranch;

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
  const branch = `ai/orchestrator-${suffix}`;
  git(["switch", "-c", branch]);
  console.log(`Branch de trabalho criada: ${branch}`);
  return branch;
}

function sharedPrompt(agentName, cycle) {
  const extra = process.env.AI_AGENT_PROMPT?.trim();
  return `Você é o agente ${agentName} no ciclo ${cycle} de um revezamento automático de desenvolvimento.

Leia, nesta ordem: AGENTS.md, CLAUDE.md, docs/PROMPT_MESTRE_IA_3D.md, docs/IMPLEMENTATION_PLAN.md, docs/AI_HANDOFF.md e docs/DECISIONS.md.
Depois verifique git status, git diff e os últimos 10 commits. Continue a primeira tarefa realmente pendente sem refazer trabalho concluído.

Regras obrigatórias:
- Trabalhe somente na branch atual e apenas neste repositório.
- Não execute git push, merge, deploy, publicação, exclusões amplas ou comandos destrutivos.
- Não inclua segredos, credenciais, dados pessoais ou arquivos privados de clientes no Git.
- Preserve alterações existentes e o modo de demonstração enquanto a migração não estiver concluída.
- Implemente, teste e documente; não encerre apenas com um plano.
- Antes de terminar, atualize docs/AI_HANDOFF.md com o que fez, testes, pendências e próxima ação.
- Faça um commit pequeno apenas com arquivos relacionados à tarefa quando os testes relevantes passarem.

Na última linha da resposta, escreva exatamente um destes marcadores:
<AI_STATUS>CONTINUE</AI_STATUS> se ainda existe trabalho executável;
<AI_STATUS>COMPLETE</AI_STATUS> se todo o plano foi concluído e validado;
<AI_STATUS>BLOCKED</AI_STATUS> se é indispensável uma decisão humana, credencial ou autorização.
${extra ? `\nInstrução adicional do operador:\n${extra}` : ""}`;
}

function agentCommand(agent, cycle) {
  const prompt = sharedPrompt(agent === "codex" ? "Codex/Astra" : "Claude/Opus", cycle);
  if (agent === "codex") {
    return {
      command: codexBin,
      args: ["exec", "--json", "--full-auto", "--model", codexModel, prompt],
    };
  }
  return {
    command: claudeBin,
    args: [
      "-p",
      "--model",
      claudeModel,
      "--output-format",
      "stream-json",
      "--verbose",
      "--max-turns",
      String(maxTurns),
      "--permission-mode",
      "acceptEdits",
      prompt,
    ],
  };
}

let activeChild = null;
let interrupted = false;

function runAgent(agent, cycle) {
  const { command, args: commandArgs } = agentCommand(agent, cycle);
  const logPath = path.join(logsDir, `${timestamp()}-${agent}-cycle-${cycle}.log`);
  const log = createWriteStream(logPath, { flags: "a" });
  const timeoutMs = timeoutMinutes * 60 * 1000;

  console.log(`\n=== Ciclo acumulado ${cycle}: ${agent} ===`);
  console.log(`Log local: ${path.relative(repoRoot, logPath)}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: repoRoot,
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    activeChild = child;

    let tail = "";
    let timedOut = false;
    const collect = (chunk, destination) => {
      const text = chunk.toString();
      destination.write(text);
      log.write(text);
      tail = `${tail}${text}`.slice(-2_000_000);
    };

    child.stdout.on("data", (chunk) => collect(chunk, process.stdout));
    child.stderr.on("data", (chunk) => collect(chunk, process.stderr));

    const timer = setTimeout(() => {
      timedOut = true;
      console.error(`\nTempo máximo de ${timeoutMinutes} minutos atingido. Encerrando ${agent}.`);
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
    }, timeoutMs);
    timer.unref();

    child.once("error", (error) => {
      clearTimeout(timer);
      activeChild = null;
      log.end();
      reject(error);
    });

    child.once("close", (exitCode, signal) => {
      clearTimeout(timer);
      activeChild = null;
      log.end();
      resolve({ exitCode, signal, tail, timedOut, logPath });
    });
  });
}

function extractMarker(output) {
  const matcher = /<AI_STATUS>\s*(CONTINUE|COMPLETE|BLOCKED)\s*<\/AI_STATUS>/gi;
  let marker = null;
  for (const match of output.matchAll(matcher)) marker = match[1].toUpperCase();
  return marker;
}

async function acquireLock() {
  try {
    const handle = await open(lockPath, "wx");
    await handle.writeFile(`${process.pid}\n`, "utf8");
    return handle;
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(
        "Já existe um orquestrador ativo. Se nenhum processo estiver rodando, apague .ai-orchestrator/lock.",
      );
    }
    throw error;
  }
}

async function main() {
  await mkdir(logsDir, { recursive: true });
  if (reset) await unlink(statePath).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });

  const environment = await inspectEnvironment();
  if (checkOnly) return;

  let state = await loadState();
  if (state.cycle === 0 && environment.dirty) {
    throw new Error(
      "O working tree já possui alterações. Faça commit ou stash antes do primeiro ciclo automático.",
    );
  }
  if (["completed", "blocked"].includes(state.status)) {
    throw new Error(`Execução anterior está ${state.status}. Use npm run agents:reset para reiniciar.`);
  }

  const lock = await acquireLock();
  try {
    if (state.branch && state.branch !== environment.branch) {
      throw new Error(
        `O estado pertence à branch ${state.branch}, mas a branch atual é ${environment.branch}.`,
      );
    }

    state.branch ||= createWorkBranch(environment.branch);
    state.status = "running";
    await saveState(state);

    let cyclesThisRun = 0;
    while (cyclesThisRun < maxCycles) {
      cyclesThisRun += 1;
      state.cycle += 1;
      const agent = state.nextAgent;
      await saveState(state);

      let result;
      try {
        result = await runAgent(agent, state.cycle);
      } catch (error) {
        result = {
          exitCode: null,
          signal: null,
          tail: "",
          timedOut: false,
          logPath: null,
          launchError: error.message,
        };
        console.error(`Falha ao iniciar ${agent}: ${error.message}`);
      }

      // Uma saída com erro normalmente representa limite, interrupção ou falha do CLI.
      // Nesse caso trocamos o agente mesmo que o fluxo JSON tenha repetido os marcadores do prompt.
      const marker = result.exitCode === 0
        ? extractMarker(result.tail) || "CONTINUE"
        : "CONTINUE";

      state.lastAgent = agent;
      state.lastExitCode = result.exitCode;
      state.lastMarker = marker;
      state.lastSignal = result.signal;
      state.lastTimedOut = result.timedOut;
      state.lastLaunchError = result.launchError || null;
      state.lastLog = result.logPath ? path.relative(repoRoot, result.logPath) : null;

      if (interrupted) {
        state.status = "paused";
        await saveState(state);
        console.log("\nExecução pausada pelo operador.");
        return;
      }

      if (marker === "COMPLETE") {
        state.status = "completed";
        await saveState(state);
        console.log("\nPlano marcado como concluído pelo agente.");
        return;
      }
      if (marker === "BLOCKED") {
        state.status = "blocked";
        await saveState(state);
        console.log("\nExecução bloqueada. Consulte docs/AI_HANDOFF.md.");
        return;
      }

      state.nextAgent = agent === "codex" ? "claude" : "codex";
      await saveState(state);
      console.log(`\nPróximo agente: ${state.nextAgent}.`);
    }

    state.status = "paused";
    await saveState(state);
    console.log(
      `\nLimite de ${maxCycles} ciclos atingido. Revise o handoff e execute novamente para continuar.`,
    );
  } finally {
    await lock.close();
    await unlink(lockPath).catch(() => {});
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    interrupted = true;
    console.error(`\nSinal ${signal} recebido. Encerrando o agente ativo...`);
    if (activeChild) activeChild.kill(signal);
    else process.exitCode = signal === "SIGINT" ? 130 : 143;
  });
}

main().catch((error) => {
  console.error(`\nErro: ${error.message}`);
  process.exitCode = 1;
});
