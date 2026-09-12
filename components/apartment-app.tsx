"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import {
  ArrowLeft, Bath, BedDouble, Boxes, Check, ChevronLeft, CircleDot, Copy, Download,
  Droplets, Edit3, ExternalLink, FileText, Flame, Heart, Home, LayoutDashboard,
  LogOut, Menu, MoreHorizontal, PackageCheck, Plus, Refrigerator, Search, Sofa, Sparkles,
  Star, Trash2, WashingMachine, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useApartmentData } from "@/hooks/use-apartment-data";
import { exportToExcel } from "@/lib/export-excel";
import type { ApartmentItem, ClientProject, Environment, EnvironmentIcon, ItemStatus, PlatformUser } from "@/lib/types";
import { ITEM_STATUSES } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { ProjectDocuments } from "./project-documents";
import { documentMessages } from "@/lib/i18n/documents";
import { EnvironmentForm } from "./environment-form";
import { ItemForm } from "./item-form";
import { Button } from "./ui/button";
import { Input, Select } from "./ui/fields";

type View = "dashboard" | "environment" | "team" | "files" | "intelligence" | "validation" | "tour";

const iconMap: Record<EnvironmentIcon, typeof Home> = {
  kitchen: Refrigerator,
  gourmet: Flame,
  laundry: WashingMachine,
  bathroom: Bath,
  living: Sofa,
  bedroom: BedDouble,
  home: Home,
};

const statusStyles: Record<ItemStatus, string> = {
  "A definir": "bg-amber-50 text-amber-700 ring-amber-200",
  Escolhido: "bg-blue-50 text-blue-700 ring-blue-200",
  Comprado: "bg-violet-50 text-violet-700 ring-violet-200",
  Entregue: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Instalado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function ApartmentApp({
  project,
  persistent = false,
  user,
  onLogout,
  onBackToAdmin,
}: {
  project: ClientProject;
  persistent?: boolean;
  user: PlatformUser;
  onLogout: () => void;
  onBackToAdmin?: () => void;
}) {
  const store = useApartmentData(project.id, persistent);
  const [view, setView] = useState<View>("dashboard");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState("");
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [environmentFormOpen, setEnvironmentFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApartmentItem | null>(null);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedEnvironment = store.data.environments.find((entry) => entry.id === selectedEnvironmentId);

  const openEnvironment = (id: string) => {
    setSelectedEnvironmentId(id);
    setView("environment");
    setSidebarOpen(false);
  };

  const openNewItem = (environmentId = selectedEnvironmentId) => {
    setSelectedEnvironmentId(environmentId || store.data.environments[0]?.id || "");
    setEditingItem(null);
    setItemFormOpen(true);
  };

  const handleExport = async () => {
    await exportToExcel(store.data);
    toast.success("Planilha exportada com sucesso.");
  };

  if (!store.hydrated) {
    return <div className="p-8">{store.persistenceError || "Organizando seu apartamento…"}<button className="ml-4 underline" onClick={onBackToAdmin}>Voltar</button></div>;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar
        open={sidebarOpen}
        environments={store.data.environments}
        selectedId={selectedEnvironmentId}
        currentView={view}
        onClose={() => setSidebarOpen(false)}
        onDashboard={() => { setView("dashboard"); setSidebarOpen(false); }}
        onTeam={() => { setView("team"); setSidebarOpen(false); }}
        onDocuments={next => { setView(next); setSidebarOpen(false); }}
        onEnvironment={openEnvironment}
        onNewEnvironment={() => { setEditingEnvironment(null); setEnvironmentFormOpen(true); setSidebarOpen(false); }}
        user={user}
        project={project}
        onLogout={onLogout}
        onBackToAdmin={onBackToAdmin}
      />

      <div className="lg:pl-[280px]">
        <Topbar
          title={view === "files" ? "Arquivos" : view === "intelligence" ? "Leitura IA" : view === "validation" ? "Validação" : view === "tour" ? "Tour 3D" : view === "dashboard" ? "Visão geral" : view === "team" ? "Visualização para equipe" : selectedEnvironment?.name ?? "Ambiente"}
          onMenu={() => setSidebarOpen(true)}
          onExport={handleExport}
          onNewItem={() => openNewItem()}
          onBackToAdmin={onBackToAdmin}
          onLogout={onLogout}
        />
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          {persistent && <p role="status" className="mb-4 rounded-xl bg-sage-soft p-3 text-sm">{store.persistenceError || (store.saving ? "Salvando alterações no servidor…" : "Dados persistidos no servidor")}</p>}
          {view === "dashboard" && (
            <DashboardView
              environments={store.data.environments}
              items={store.data.items}
              stats={store.stats}
              onOpenEnvironment={openEnvironment}
              onNewEnvironment={() => { setEditingEnvironment(null); setEnvironmentFormOpen(true); }}
              onNewItem={openNewItem}
              onTeam={() => setView("team")}
              projectName={project.name}
            />
          )}
          {view === "environment" && selectedEnvironment && (
            <EnvironmentView
              environment={selectedEnvironment}
              items={store.data.items.filter((item) => item.environmentId === selectedEnvironment.id)}
              onBack={() => setView("dashboard")}
              onNewItem={() => openNewItem(selectedEnvironment.id)}
              onEditItem={(item) => { setEditingItem(item); setItemFormOpen(true); }}
              onPatchItem={store.patchItem}
              onDuplicate={(id) => { store.duplicateItem(id); toast.success("Item duplicado."); }}
              onDeleteItem={(id) => { if (confirm("Excluir este item?")) { store.deleteItem(id); toast.success("Item excluído."); } }}
              onEditEnvironment={() => { setEditingEnvironment(selectedEnvironment); setEnvironmentFormOpen(true); }}
              onDeleteEnvironment={() => {
                if (confirm(`Excluir "${selectedEnvironment.name}" e todos os seus itens?`)) {
                  store.deleteEnvironment(selectedEnvironment.id);
                  setView("dashboard");
                  toast.success("Ambiente excluído.");
                }
              }}
            />
          )}
          {["files", "intelligence", "validation", "tour"].includes(view) && !persistent && <p className="surface-card rounded-xl p-6">Documentos privados estão disponíveis na área persistente. A demonstração mantém os dados deste navegador.</p>}
          {persistent && view === "files" && <ProjectDocuments projectId={project.id} canEdit={user.role === "admin"} />}
          {persistent && ["intelligence", "validation", "tour"].includes(view) && <p className="surface-card rounded-xl p-6">{documentMessages.pt.pending} A modelagem exige medidas confirmadas e revisão humana.</p>}
          {view === "team" && <TeamView environments={store.data.environments} items={store.data.items} />}
        </main>
      </div>

      <ItemForm
        open={itemFormOpen}
        onClose={() => setItemFormOpen(false)}
        onSave={(values, id) => { store.saveItem(values, id); toast.success(id ? "Item atualizado." : "Item cadastrado."); }}
        environments={store.data.environments}
        initialEnvironmentId={selectedEnvironmentId}
        item={editingItem}
      />
      <EnvironmentForm
        open={environmentFormOpen}
        onClose={() => setEnvironmentFormOpen(false)}
        onCreate={(values) => { store.addEnvironment(values); toast.success("Ambiente criado."); }}
        onUpdate={(environment) => { store.updateEnvironment(environment); toast.success("Ambiente atualizado."); }}
        environment={editingEnvironment}
      />
    </div>
  );
}

function Sidebar({ open, environments, selectedId, currentView, onClose, onDashboard, onTeam, onDocuments, onEnvironment, onNewEnvironment, user, project, onLogout, onBackToAdmin }: {
  open: boolean; environments: Environment[]; selectedId: string; currentView: View; onClose: () => void;
  onDocuments: (view: "files" | "intelligence" | "validation" | "tour") => void;
  onDashboard: () => void; onTeam: () => void; onEnvironment: (id: string) => void; onNewEnvironment: () => void;
  user: PlatformUser; project: ClientProject; onLogout: () => void; onBackToAdmin?: () => void;
}) {
  return (
    <>
      {open && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.06] bg-ink text-white shadow-2xl shadow-ink/10 transition-transform duration-300 lg:translate-x-0 lg:shadow-none", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[92px] items-center justify-between px-6">
          <button className="flex items-center gap-3 text-left" onClick={onDashboard}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-black/10"><Sparkles className="h-[18px] w-[18px]" /></div>
            <div><div className="font-display text-xl font-semibold leading-none tracking-tight">Morada</div><div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">Projeto de interiores</div></div>
          </button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3.5 pb-5">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Principal</p>
          {onBackToAdmin && <NavButton active={false} icon={ArrowLeft} label="Voltar aos projetos" onClick={onBackToAdmin} />}
          <NavButton active={currentView === "dashboard"} icon={LayoutDashboard} label="Visão geral" onClick={onDashboard} />
          {(["files", "intelligence", "validation", "tour"] as const).map(section => <NavButton key={section} active={currentView === section} icon={FileText} label={documentMessages.pt[section]} onClick={() => onDocuments(section)} />)}
          <NavButton active={currentView === "team"} icon={Boxes} label="Visualização para equipe" onClick={onTeam} />
          <div className="mb-2 mt-7 flex items-center justify-between px-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Ambientes</p>
            <button aria-label="Novo ambiente" className="grid h-7 w-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white" onClick={onNewEnvironment}><Plus className="h-3.5 w-3.5" /></button>
          </div>
          <div className="space-y-1">
            {environments.map((environment) => {
              const Icon = iconMap[environment.icon];
              return <NavButton key={environment.id} active={currentView === "environment" && selectedId === environment.id} icon={Icon} label={environment.name} onClick={() => onEnvironment(environment.id)} />;
            })}
          </div>
        </nav>
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.045] p-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage text-xs font-bold ring-2 ring-white/10">{initials(user.name)}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-white/40">{project.name}</p></div>
            <button onClick={onLogout} className="text-white/40 hover:text-white" aria-label="Sair"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Home; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={cn("relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-white/[0.1] text-white shadow-sm" : "text-white/55 hover:bg-white/[0.055] hover:text-white")}><span className={cn("absolute left-0 h-5 w-0.5 rounded-full bg-brand opacity-0", active && "opacity-100")} /><Icon className={cn("h-4 w-4", active ? "text-brand-soft" : "text-white/40")} /><span className="truncate">{label}</span></button>;
}

function Topbar({ title, onMenu, onExport, onNewItem, onBackToAdmin, onLogout }: { title: string; onMenu: () => void; onExport: () => void; onNewItem: () => void; onBackToAdmin?: () => void; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}><Menu className="h-5 w-5" /></Button>
        <div className="min-w-0"><p className="hidden text-[9px] font-bold uppercase tracking-[.18em] text-slate-400 sm:block">Projeto atual</p><h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1></div>
      </div>
      <div className="flex items-center gap-2">
        {onBackToAdmin && <Button variant="outline" className="hidden xl:inline-flex" onClick={onBackToAdmin}><ArrowLeft className="h-4 w-4" /> Projetos</Button>}
        <Button variant="outline" className="hidden sm:inline-flex" onClick={onExport}><Download className="h-4 w-4" /> Exportar Excel</Button>
        <Button variant="outline" size="icon" className="sm:hidden" onClick={onExport} aria-label="Exportar Excel"><Download className="h-4 w-4" /></Button>
        <Button variant="secondary" onClick={onNewItem}><Plus className="h-4 w-4" /><span className="hidden sm:inline">Novo item</span></Button>
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onLogout} aria-label="Sair"><LogOut className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}

function DashboardView({ environments, items, stats, onOpenEnvironment, onNewEnvironment, onNewItem, onTeam, projectName }: {
  environments: Environment[]; items: ApartmentItem[]; stats: ReturnType<typeof useApartmentData>["stats"];
  onOpenEnvironment: (id: string) => void; onNewEnvironment: () => void; onNewItem: (id?: string) => void; onTeam: () => void; projectName: string;
}) {
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[26px] bg-ink p-6 text-white shadow-soft sm:p-8">
        <div className="absolute -right-14 -top-28 h-80 w-80 rounded-full border-[54px] border-white/[0.04]" />
        <div className="absolute -bottom-24 right-36 h-56 w-56 rounded-full bg-brand/10 blur-2xl" />
        <div className="absolute inset-y-0 right-0 hidden w-1/3 opacity-[.035] lg:block" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "38px 38px" }} />
        <div className="relative max-w-2xl">
          <p className="eyebrow !text-brand-soft">{projectName}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tightest sm:text-[42px]">Tudo o que a marcenaria precisa, organizado.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Centralize medidas, modelos e detalhes técnicos para que compras e projeto avancem sem retrabalho.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => onNewItem()}><Plus className="h-4 w-4" /> Adicionar item</Button>
            <Button className="bg-white/10 text-white hover:bg-white/15" onClick={onTeam}><Boxes className="h-4 w-4" /> Modo equipe</Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Ambientes" value={stats.environments} icon={Home} tone="sage" />
        <StatCard label="Itens cadastrados" value={stats.total} icon={Boxes} tone="ink" />
        <StatCard label="A definir" value={stats.undecided} icon={CircleDot} tone="amber" />
        <StatCard label="Comprados" value={stats.purchased} icon={PackageCheck} tone="violet" />
        <StatCard label="Instalados" value={stats.installed} icon={Check} tone="green" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div><p className="eyebrow">Organização</p><h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Ambientes</h2></div>
            <Button variant="ghost" size="sm" onClick={onNewEnvironment}><Plus className="h-4 w-4" /> Novo ambiente</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {environments.map((environment) => {
              const environmentItems = items.filter((item) => item.environmentId === environment.id);
              const completed = environmentItems.filter((item) => item.status === "Instalado").length;
              const Icon = iconMap[environment.icon];
              return (
                <button key={environment.id} onClick={() => onOpenEnvironment(environment.id)} className="group surface-card rounded-[20px] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-sage/35 hover:shadow-lift">
                  <div className="flex items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundColor: environment.color }}><Icon className="h-[18px] w-[18px]" /></div>
                    <span className="text-xs font-semibold text-slate-400">{environmentItems.length} {environmentItems.length === 1 ? "item" : "itens"}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{environment.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{environment.description}</p>
                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sage transition-all" style={{ width: `${environmentItems.length ? (completed / environmentItems.length) * 100 : 0}%` }} /></div>
                  <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400"><span>{completed} instalados</span><span className="text-ink transition group-hover:translate-x-0.5">Abrir →</span></div>
                </button>
              );
            })}
            <button onClick={onNewEnvironment} className="grid min-h-52 place-items-center rounded-[20px] border border-dashed border-slate-300 bg-white/35 p-5 text-center text-slate-500 transition hover:border-sage hover:bg-white hover:shadow-card">
              <div><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-sage-soft text-sage-dark"><Plus className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-ink">Criar ambiente</p><p className="mt-1 text-xs">Adicione outro espaço</p></div>
            </button>
          </div>
        </div>
        <CompletionCard percentage={stats.completion} items={items} />
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Home; tone: string }) {
  const colors: Record<string, string> = { sage: "bg-sage-soft text-sage-dark", ink: "bg-slate-100 text-ink", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700", green: "bg-emerald-50 text-emerald-700" };
  return <div className="surface-card rounded-[18px] p-4 transition hover:border-slate-300 sm:p-5"><div className={cn("grid h-9 w-9 place-items-center rounded-xl", colors[tone])}><Icon className="h-4 w-4" /></div><p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{label}</p></div>;
}

function CompletionCard({ percentage, items }: { percentage: number; items: ApartmentItem[] }) {
  const resolved = items.filter((item) => item.status !== "A definir").length;
  return (
    <div className="surface-card self-start rounded-[22px] bg-gradient-to-b from-sage-soft to-[#edf3f0] p-6">
      <p className="eyebrow !text-sage-dark">Progresso geral</p>
      <div className="relative mx-auto mt-7 grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(#c96a43 ${percentage * 3.6}deg, rgba(255,255,255,.7) 0deg)` }}>
        <div className="grid h-32 w-32 place-items-center rounded-full bg-[#eaf1ed] text-center shadow-inner"><div><span className="font-display text-4xl font-semibold tracking-tight">{percentage}%</span><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">concluído</p></div></div>
      </div>
      <div className="mt-7 space-y-3 rounded-2xl border border-white/70 bg-white/55 p-4 text-sm">
        <div className="flex justify-between"><span className="text-slate-500">Decisões tomadas</span><strong>{resolved}/{items.length}</strong></div>
        <div className="flex justify-between"><span className="text-slate-500">Instalações finais</span><strong>{items.filter((item) => item.status === "Instalado").length}</strong></div>
      </div>
    </div>
  );
}

function EnvironmentView({ environment, items, onBack, onNewItem, onEditItem, onPatchItem, onDuplicate, onDeleteItem, onEditEnvironment, onDeleteEnvironment }: {
  environment: Environment; items: ApartmentItem[]; onBack: () => void; onNewItem: () => void; onEditItem: (item: ApartmentItem) => void;
  onPatchItem: (id: string, patch: Partial<ApartmentItem>) => void; onDuplicate: (id: string) => void; onDeleteItem: (id: string) => void;
  onEditEnvironment: () => void; onDeleteEnvironment: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [menuId, setMenuId] = useState("");
  const filtered = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.name} ${item.brand} ${item.model} ${item.productCode} ${item.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "Todos" || item.status === status);
  }), [items, search, status]);

  return (
    <div>
      <button onClick={onBack} className="mb-5 flex items-center gap-1 rounded-lg text-xs font-semibold text-slate-500 transition hover:text-ink"><ChevronLeft className="h-4 w-4" /> Todos os ambientes</button>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          {(() => { const Icon = iconMap[environment.icon]; return <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: environment.color }}><Icon className="h-6 w-6" /></div>; })()}
          <div><p className="eyebrow">Ambiente</p><h2 className="font-display text-3xl font-semibold tracking-tightest">{environment.name}</h2><p className="mt-1 text-sm text-slate-500">{environment.description}</p></div>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={onEditEnvironment}><Edit3 className="h-4 w-4" /> Editar</Button><Button variant="danger" size="icon" onClick={onDeleteEnvironment}><Trash2 className="h-4 w-4" /></Button></div>
      </div>
      <div className="surface-card mb-5 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="border-0 bg-slate-50 pl-10 focus:ring-0" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por item, marca, modelo ou código..." /></div>
        <Select className="border-0 bg-slate-50 sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}><option>Todos</option>{ITEM_STATUSES.map((entry) => <option key={entry}>{entry}</option>)}</Select>
        <Button variant="secondary" onClick={onNewItem}><Plus className="h-4 w-4" /> Adicionar item</Button>
      </div>
      {filtered.length ? (
        <>
          <div className="surface-card hidden overflow-visible rounded-[20px] md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50/70"><tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-3.5">Item</th><th className="px-4 py-3.5">Detalhes</th><th className="px-4 py-3.5">Medidas</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-center">Pontos</th><th className="w-16 px-4 py-3.5" /></tr></thead>
              <tbody>{filtered.map((item) => <ItemRow key={item.id} item={item} menuOpen={menuId === item.id} onMenu={() => setMenuId(menuId === item.id ? "" : item.id)} onEdit={() => onEditItem(item)} onPatch={onPatchItem} onDuplicate={onDuplicate} onDelete={onDeleteItem} />)}</tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">{filtered.map((item) => <MobileItemCard key={item.id} item={item} onEdit={() => onEditItem(item)} onPatch={onPatchItem} />)}</div>
        </>
      ) : <EmptyState onNewItem={onNewItem} />}
    </div>
  );
}

function ItemRow({ item, menuOpen, onMenu, onEdit, onPatch, onDuplicate, onDelete }: { item: ApartmentItem; menuOpen: boolean; onMenu: () => void; onEdit: () => void; onPatch: (id: string, patch: Partial<ApartmentItem>) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <tr className="border-b border-slate-100 transition last:border-0 hover:bg-sage/[0.035]">
      <td className="px-5 py-4"><div className="flex items-center gap-3">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-xl bg-slate-100 object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-400">{initials(item.name)}</div>}<div><div className="flex items-center gap-1.5"><button onClick={onEdit} className="font-semibold hover:text-brand">{item.name}</button><button onClick={() => onPatch(item.id, { favorite: !item.favorite })}><Star className={cn("h-3.5 w-3.5", item.favorite ? "fill-amber-400 text-amber-400" : "text-slate-300")} /></button></div><p className="mt-0.5 text-xs text-slate-400">{item.category || "Sem categoria"}</p></div></div></td>
      <td className="px-4 py-4"><p className="text-sm font-medium">{[item.brand, item.model].filter(Boolean).join(" · ") || "—"}</p><p className="mt-0.5 text-xs text-slate-400">{item.productCode || "Sem código"}</p></td>
      <td className="px-4 py-4"><p className="max-w-40 text-sm font-medium">{item.dimensions || "—"}</p><p className="mt-0.5 text-xs text-slate-400">{item.voltage || "—"}</p></td>
      <td className="px-4 py-4"><select value={item.status} onChange={(e) => onPatch(item.id, { status: e.target.value as ItemStatus })} className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold outline-none ring-1", statusStyles[item.status])}>{ITEM_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td>
      <td className="px-4 py-4"><div className="flex justify-center gap-1.5"><RequirementIcon active={item.needsElectrical} icon={Zap} label="Ponto elétrico" /><RequirementIcon active={item.needsPlumbing} icon={Droplets} label="Ponto hidráulico" /><RequirementIcon active={item.needsCutout} icon={Boxes} label="Nicho/recorte" /></div></td>
      <td className="relative px-4 py-4"><Button variant="ghost" size="icon" onClick={onMenu}><MoreHorizontal className="h-4 w-4" /></Button>{menuOpen && <div className="absolute right-10 top-12 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><MenuAction icon={Edit3} label="Editar" onClick={onEdit} /><MenuAction icon={Copy} label="Duplicar" onClick={() => { onDuplicate(item.id); onMenu(); }} /><MenuAction icon={Trash2} label="Excluir" danger onClick={() => { onDelete(item.id); onMenu(); }} /></div>}</td>
    </tr>
  );
}

function MobileItemCard({ item, onEdit, onPatch }: { item: ApartmentItem; onEdit: () => void; onPatch: (id: string, patch: Partial<ApartmentItem>) => void }) {
  return <div className="surface-card rounded-[18px] p-4"><div className="flex gap-3">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-100 font-bold text-slate-400">{initials(item.name)}</div>}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><button onClick={onEdit} className="truncate text-left font-semibold">{item.name}</button><button onClick={() => onPatch(item.id, { favorite: !item.favorite })}><Heart className={cn("h-4 w-4", item.favorite && "fill-brand text-brand")} /></button></div><p className="mt-0.5 text-xs text-slate-400">{item.category} · {item.brand || "Marca a definir"}</p><span className={cn("mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ring-1", statusStyles[item.status])}>{item.status}</span></div></div><div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 text-xs"><div><span className="text-slate-400">Medidas</span><p className="mt-0.5 font-semibold">{item.dimensions || "—"}</p></div><div><span className="text-slate-400">Voltagem</span><p className="mt-0.5 font-semibold">{item.voltage || "—"}</p></div></div></div>;
}

function RequirementIcon({ active, icon: Icon, label }: { active: boolean; icon: typeof Zap; label: string }) {
  return <span title={label} className={cn("grid h-7 w-7 place-items-center rounded-lg", active ? "bg-brand-soft text-brand-dark" : "bg-slate-50 text-slate-300")}><Icon className="h-3.5 w-3.5" /></span>;
}

function MenuAction({ icon: Icon, label, onClick, danger }: { icon: typeof Edit3; label: string; onClick: () => void; danger?: boolean }) {
  return <button onClick={onClick} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-50", danger && "text-red-600")}><Icon className="h-3.5 w-3.5" />{label}</button>;
}

function EmptyState({ onNewItem }: { onNewItem: () => void }) {
  return <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/50 px-5 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-sage-dark"><Search className="h-5 w-5" /></div><h3 className="mt-4 font-display text-xl font-semibold">Nenhum item encontrado</h3><p className="mt-1 text-sm text-slate-500">Ajuste os filtros ou cadastre um novo item.</p><Button className="mt-5" variant="secondary" onClick={onNewItem}><Plus className="h-4 w-4" /> Adicionar item</Button></div>;
}

function TeamView({ environments, items }: { environments: Environment[]; items: ApartmentItem[] }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((item) => `${item.name} ${item.brand} ${item.model} ${item.productCode} ${item.notes}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-7">
      <div className="surface-card rounded-[22px] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Documento técnico</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tightest">Especificações para marcenaria</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Consulta consolidada de medidas, códigos, manuais e requisitos de instalação.</p></div>
          <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" placeholder="Buscar especificação..." /></div>
        </div>
      </div>
      {environments.map((environment) => {
        const environmentItems = filtered.filter((item) => item.environmentId === environment.id);
        if (!environmentItems.length) return null;
        const Icon = iconMap[environment.icon];
        return <section key={environment.id}><div className="mb-3 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundColor: environment.color }}><Icon className="h-4 w-4" /></div><h3 className="font-display text-2xl font-semibold tracking-tight">{environment.name}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{environmentItems.length} itens</span></div><div className="grid gap-3 lg:grid-cols-2">{environmentItems.map((item) => <TeamItem key={item.id} item={item} />)}</div></section>;
      })}
    </div>
  );
}

function TeamItem({ item }: { item: ApartmentItem }) {
  return (
    <article className="surface-card rounded-[18px] p-5 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h4 className="font-semibold">{item.name}</h4>{item.favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}</div><p className="mt-1 text-xs text-slate-400">{[item.brand, item.model].filter(Boolean).join(" · ") || item.category}</p></div><span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1", statusStyles[item.status])}>{item.status}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4 text-xs"><TechDetail label="Medidas" value={item.dimensions} highlight /><TechDetail label="Código" value={item.productCode} /><TechDetail label="Voltagem" value={item.voltage} /><TechDetail label="Acabamento" value={item.finish} /></div>
      <div className="mt-3 flex flex-wrap gap-2">{item.needsElectrical && <Tag icon={Zap} label="Ponto elétrico" />}{item.needsPlumbing && <Tag icon={Droplets} label="Ponto hidráulico" />}{item.needsCutout && <Tag icon={Boxes} label="Nicho/recorte" />}</div>
      {item.carpentryPending && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pendência para marcenaria</p><p className="mt-1 text-xs leading-5 text-amber-900">{item.carpentryPending}</p></div>}
      {item.notes && <p className="mt-4 text-xs leading-5 text-slate-500"><strong className="text-ink">Observações:</strong> {item.notes}</p>}
      {(item.productUrl || item.manualUrl) && <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{item.productUrl && <LinkButton href={item.productUrl} icon={ExternalLink} label="Ver produto" />}{item.manualUrl && <LinkButton href={item.manualUrl} icon={FileText} label="Manual técnico" />}</div>}
    </article>
  );
}

function TechDetail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={cn("mt-1 font-semibold", highlight && value && "text-brand-dark")}>{value || "—"}</p></div>;
}

function Tag({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-lg bg-sage-soft px-2.5 py-1.5 text-[10px] font-bold text-sage-dark"><Icon className="h-3 w-3" />{label}</span>;
}

function LinkButton({ href, icon: Icon, label }: { href: string; icon: typeof FileText; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-ink transition hover:border-sage hover:bg-sage/5"><Icon className="h-3.5 w-3.5" />{label}</a>;
}
