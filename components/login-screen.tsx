"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, FileText, LockKeyhole, Ruler, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/fields";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<boolean>;
}) {
  const [email, setEmail] = useState("cliente@example.invalid");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!await onLogin(email, password)) toast.error("E-mail ou senha inválidos.");
  };

  const selectDemo = (type: "client" | "admin") => {
    if (type === "admin") {
      setEmail("admin@example.invalid");
      setPassword("admin123");
    } else {
      setEmail("cliente@example.invalid");
      setPassword("demo123");
    }
  };

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-ink px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
        <div className="absolute -right-40 -top-44 h-[620px] w-[620px] rounded-full border-[100px] border-white/[0.035]" />
        <div className="absolute -bottom-24 -left-12 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand shadow-lg shadow-black/15"><Sparkles className="h-5 w-5" /></div>
          <div><p className="font-display text-2xl font-semibold tracking-tight">Morada</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.22em] text-white/40">Portal da marcenaria</p></div>
        </div>
        <div className="relative max-w-2xl">
          <p className="eyebrow !text-brand-soft">Do briefing à instalação</p>
          <h1 className="mt-5 max-w-xl font-display text-5xl font-semibold leading-[1.03] tracking-tightest xl:text-[3.65rem]">Especificações claras. Projetos sem retrabalho.</h1>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/55">Centralize eletros, medidas, manuais e decisões técnicas em um único espaço compartilhado entre cliente e marcenaria.</p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <LoginFeature icon={Ruler} label="Medidas organizadas" />
            <LoginFeature icon={FileText} label="Manuais centralizados" />
            <LoginFeature icon={CheckCircle2} label="Decisões rastreáveis" />
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Demonstração local · dados salvos neste navegador</div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-9 lg:hidden">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white"><Sparkles className="h-5 w-5 text-brand-soft" /></div><div><p className="font-display text-2xl font-semibold tracking-tight">Morada</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Portal da marcenaria</p></div></div>
          </div>
          <div className="surface-card rounded-[24px] p-6 sm:p-8">
            <p className="eyebrow">Acesso ao projeto</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tightest text-ink">Bem-vindo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Entre para acessar seus projetos e especificações.</p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div><Label>E-mail</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
              <div>
                <div className="flex items-center justify-between"><Label>Senha</Label><span className="mb-2 text-xs text-slate-400">Acesso demonstrativo</span></div>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="pr-11" required />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label="Mostrar senha">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full">Entrar no sistema <ArrowRight className="h-4 w-4" /></Button>
            </form>
          </div>

          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preencher acesso</span><div className="h-px flex-1 bg-slate-200" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => selectDemo("client")} className="group surface-card rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift"><div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand"><LockKeyhole className="h-4 w-4" /></div><p className="mt-3 text-sm font-bold">Cliente demonstração</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Edita o próprio apartamento</p></button>
            <button onClick={() => selectDemo("admin")} className="group surface-card rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-sage/50 hover:shadow-lift"><div className="grid h-8 w-8 place-items-center rounded-lg bg-sage-soft text-sage-dark"><Users className="h-4 w-4" /></div><p className="mt-3 text-sm font-bold">Administrador</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Gerencia clientes e projetos</p></button>
          </div>
        </div>
      </section>
    </main>
  );
}

function LoginFeature({ icon: Icon, label }: { icon: typeof Ruler; label: string }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur"><Icon className="h-4 w-4 text-brand-soft" /><p className="mt-3 text-xs font-medium leading-5 text-white/60">{label}</p></div>;
}
