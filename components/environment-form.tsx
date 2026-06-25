"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import type { Environment, EnvironmentIcon } from "@/lib/types";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input, Label, Select, Textarea } from "./ui/fields";

const colors = ["#C96A43", "#6F8F84", "#6B84A8", "#8A7DA8", "#B08A5B", "#A16F78", "#4D7066"];

export function EnvironmentForm({
  open,
  onClose,
  onCreate,
  onUpdate,
  environment,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (values: Omit<Environment, "id" | "createdAt">) => void;
  onUpdate: (environment: Environment) => void;
  environment?: Environment | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<EnvironmentIcon>("home");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    if (!open) return;
    setName(environment?.name ?? "");
    setDescription(environment?.description ?? "");
    setIcon(environment?.icon ?? "home");
    setColor(environment?.color ?? colors[0]);
  }, [open, environment]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (environment) onUpdate({ ...environment, name, description, icon, color });
    else onCreate({ name, description, icon, color });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={environment ? "Editar ambiente" : "Novo ambiente"} description="Use os ambientes para organizar os itens por espaço do apartamento.">
      <form onSubmit={submit}>
        <div className="space-y-5 px-5 py-6 sm:px-7">
          <div><Label>Nome do ambiente *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cozinha" required /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Uma breve descrição do espaço" /></div>
          <div><Label>Tipo de ambiente</Label><Select value={icon} onChange={(e) => setIcon(e.target.value as EnvironmentIcon)}>
            <option value="kitchen">Cozinha</option><option value="gourmet">Área gourmet</option><option value="laundry">Lavanderia</option><option value="bathroom">Banheiro</option><option value="living">Sala</option><option value="bedroom">Quarto / suíte</option><option value="home">Geral</option>
          </Select></div>
          <div>
            <Label>Cor de identificação</Label>
            <div className="flex flex-wrap gap-3">{colors.map((entry) => <button key={entry} type="button" aria-label={`Selecionar cor ${entry}`} onClick={() => setColor(entry)} className="h-9 w-9 rounded-full transition" style={{ backgroundColor: entry, boxShadow: color === entry ? "0 0 0 3px white, 0 0 0 5px #18322d" : undefined }} />)}</div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="secondary"><Save className="h-4 w-4" /> Salvar ambiente</Button>
        </div>
      </form>
    </Dialog>
  );
}
