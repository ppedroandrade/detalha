"use client";

import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input, Label } from "./ui/fields";

export function ClientForm({
  open,
  onClose,
  onCreate,
  existingEmails,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (values: { name: string; email: string; password: string; projectName: string }) => void;
  existingEmails: string[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (existingEmails.some((entry) => entry.toLowerCase() === email.trim().toLowerCase())) {
      setError("Já existe um usuário com este e-mail.");
      return;
    }
    onCreate({ name, email, password, projectName });
    setName(""); setEmail(""); setPassword(""); setProjectName(""); setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Novo cliente" description="O cliente receberá acesso a um projeto próprio com os ambientes iniciais.">
      <form onSubmit={submit}>
        <div className="space-y-5 px-5 py-6 sm:px-7">
          <div><Label>Nome do cliente *</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Ana e Bruno" required /></div>
          <div><Label>E-mail de acesso *</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="cliente@email.com" required /></div>
          <div><Label>Senha inicial *</Label><Input value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} placeholder="Mínimo de 6 caracteres" required /></div>
          <div><Label>Nome do projeto *</Label><Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Ex.: Apartamento Ana e Bruno" required /></div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="secondary"><UserPlus className="h-4 w-4" /> Criar acesso</Button>
        </div>
      </form>
    </Dialog>
  );
}
