"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, CheckCircle2, CircleDot, FolderOpen, LogOut,
  MoreHorizontal, Search, Sparkles, UserPlus, Users,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientProject, PlatformData, PlatformUser, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { Button } from "./ui/button";
import { Input, Select } from "./ui/fields";

const projectStatusStyles: Partial<Record<ProjectStatus, string>> = {
  "Coleta de dados": "bg-amber-50 text-amber-700",
  "Em revisão": "bg-blue-50 text-blue-700",
  "Concluído": "bg-emerald-50 text-emerald-700",
};

export function AdminDashboard({
  data,
  persistent = false,
  admin,
  onOpenProject,
  onCreateClient,
  onUpdateUser,
  onUpdateProject,
  onLogout,
}: {
  data: PlatformData;
  persistent?: boolean;
  admin: PlatformUser;
  onOpenProject: (project: ClientProject) => void;
  onCreateClient: (values: { name: string; email: string; password: string; projectName: string }) => void | Promise<void>;
  onUpdateUser: (id: string, patch: Partial<PlatformUser>) => void;
  onUpdateProject: (id: string, patch: Partial<ClientProject>) => void;
  onLogout: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const clients = data.users.filter((user) => user.role === "client");
  const filteredProjects = useMemo(
    () =>
      data.projects.filter((project) => {
        const client = clients.find((user) => user.id === project.clientId);
        return `${project.name} ${client?.name ?? ""} ${client?.email ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [clients, data.projects, search],
  );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white shadow-sm"><Sparkles className="h-4 w-4 text-brand-soft" /></div>
            <div><p className="font-display text-xl font-semibold tracking-tight text-ink">Morada</p><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">Gestão da marcenaria</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-ink">{admin.name}</p><p className="text-[11px] text-slate-400">Administrador</p></div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sage-soft text-xs font-bold text-sage-dark">{admin.name.slice(0, 2).toUpperCase()}</div>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sair"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[26px] bg-ink px-6 py-7 text-white shadow-soft sm:px-8 sm:py-9">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[54px] border-white/[0.04]" />
          <div className="absolute bottom-0 right-1/4 h-32 w-64 bg-brand/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="eyebrow !text-brand-soft">Painel administrativo</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tightest sm:text-5xl">Clientes e projetos</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Acompanhe o preenchimento, identifique pendências e acesse as especificações de cada cliente.</p></div>
            <Button variant="secondary" onClick={() => setFormOpen(true)}><UserPlus className="h-4 w-4" /> Cadastrar cliente</Button>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <AdminStat icon={Users} label="Clientes cadastrados" value={clients.length} tone="brand" />
          <AdminStat icon={FolderOpen} label="Projetos ativos" value={data.projects.filter((project) => project.status !== "Concluído").length} tone="sage" />
          <AdminStat icon={CheckCircle2} label="Projetos concluídos" value={data.projects.filter((project) => project.status === "Concluído").length} tone="green" />
        </section>

        <section className="surface-card mt-6 overflow-hidden rounded-[22px]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div><p className="eyebrow">Carteira de clientes</p><h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Projetos</h2><p className="mt-1 text-xs text-slate-400">Abra um projeto para revisar ambientes, produtos e dados técnicos.</p></div>
            <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente ou projeto..." /></div>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50/70"><tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400"><th className="px-6 py-3.5">Cliente</th><th className="px-4 py-3.5">Projeto</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Acesso</th><th className="w-20 px-4 py-3.5" /></tr></thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const client = clients.find((user) => user.id === project.clientId);
                  if (!client) return null;
                  return (
                    <tr key={project.id} className="border-b border-slate-100 transition last:border-0 hover:bg-sage/[0.035]">
                      <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-sage-soft text-xs font-bold text-sage-dark">{client.name.slice(0, 2).toUpperCase()}</div><div><p className="text-sm font-semibold text-ink">{client.name}</p><p className="text-xs text-slate-400">{client.email}</p></div></div></td>
                      <td className="px-4 py-5"><p className="text-sm font-semibold text-ink">{project.name}</p><p className="mt-1 text-xs text-slate-400">Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}</p></td>
                      <td className="px-4 py-5"><Select disabled={persistent} value={project.status} onChange={(event) => onUpdateProject(project.id, { status: event.target.value as ProjectStatus })} className={cn("h-9 w-40 border-0 text-xs font-bold", projectStatusStyles[project.status])}>{persistent && <option>{project.status}</option>}<option>Coleta de dados</option><option>Em revisão</option><option>Concluído</option></Select></td>
                      <td className="px-4 py-5"><button onClick={() => { onUpdateUser(client.id, { active: !client.active }); toast.success(client.active ? "Acesso do cliente bloqueado." : "Acesso do cliente liberado."); }} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold", client.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}><CircleDot className="h-3 w-3" />{client.active ? "Ativo" : "Bloqueado"}</button></td>
                      <td className="px-4 py-5"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => onOpenProject(project)} aria-label="Abrir projeto"><ArrowRight className="h-4 w-4" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filteredProjects.map((project) => {
              const client = clients.find((user) => user.id === project.clientId);
              if (!client) return null;
              return <button key={project.id} onClick={() => onOpenProject(project)} className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-sage/50 hover:bg-sage/[0.03]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-ink">{project.name}</p><p className="mt-1 text-xs text-slate-400">{client.name} · {client.email}</p></div><MoreHorizontal className="h-4 w-4 text-slate-400" /></div><span className={cn("mt-4 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold", projectStatusStyles[project.status])}>{project.status}</span></button>;
            })}
          </div>
        </section>
      </main>

      <ClientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existingEmails={data.users.map((user) => user.email)}
        onCreate={async (values) => {
          await onCreateClient(values);
          toast.success("Cliente e projeto criados.");
        }}
      />
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: "brand" | "sage" | "green" }) {
  const tones = { brand: "bg-brand-soft text-brand-dark", sage: "bg-sage-soft text-sage-dark", green: "bg-emerald-50 text-emerald-700" };
  return <div className="surface-card flex items-center gap-4 rounded-[18px] p-4 sm:p-5"><div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}><Icon className="h-[18px] w-[18px]" /></div><div><p className="text-2xl font-bold tracking-tight text-ink">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div></div>;
}
