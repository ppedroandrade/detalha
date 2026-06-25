"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Save } from "lucide-react";
import type { ApartmentItem, Environment } from "@/lib/types";
import { ITEM_STATUSES } from "@/lib/types";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input, Label, Select, Textarea } from "./ui/fields";

type ItemValues = Omit<ApartmentItem, "id" | "createdAt" | "updatedAt">;

const emptyValues = (environmentId: string): ItemValues => ({
  environmentId,
  name: "",
  category: "",
  brand: "",
  model: "",
  productCode: "",
  quantity: 1,
  dimensions: "",
  voltage: "",
  finish: "",
  productUrl: "",
  manualUrl: "",
  notes: "",
  status: "A definir",
  imageUrl: "",
  favorite: false,
  carpentryPending: "",
  needsElectrical: false,
  needsPlumbing: false,
  needsCutout: false,
});

export function ItemForm({
  open,
  onClose,
  onSave,
  environments,
  initialEnvironmentId,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: ItemValues, id?: string) => void;
  environments: Environment[];
  initialEnvironmentId: string;
  item?: ApartmentItem | null;
}) {
  const [values, setValues] = useState<ItemValues>(emptyValues(initialEnvironmentId));

  useEffect(() => {
    if (open) {
      setValues(
        item
          ? {
              environmentId: item.environmentId,
              name: item.name,
              category: item.category,
              brand: item.brand,
              model: item.model,
              productCode: item.productCode,
              quantity: item.quantity,
              dimensions: item.dimensions,
              voltage: item.voltage,
              finish: item.finish,
              productUrl: item.productUrl,
              manualUrl: item.manualUrl,
              notes: item.notes,
              status: item.status,
              imageUrl: item.imageUrl,
              favorite: item.favorite,
              carpentryPending: item.carpentryPending,
              needsElectrical: item.needsElectrical,
              needsPlumbing: item.needsPlumbing,
              needsCutout: item.needsCutout,
            }
          : emptyValues(initialEnvironmentId || environments[0]?.id || ""),
      );
    }
  }, [open, item, initialEnvironmentId, environments]);

  const update = <K extends keyof ItemValues>(key: K, value: ItemValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(values, item?.id);
    onClose();
  };

  const handleUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("imageUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={item ? "Editar item" : "Novo item"}
      description="Centralize aqui todas as informações importantes para compra e marcenaria."
      wide
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-7">
          <Field label="Nome do item *">
            <Input value={values.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex.: Cooktop 5 bocas" required />
          </Field>
          <Field label="Ambiente *">
            <Select value={values.environmentId} onChange={(e) => update("environmentId", e.target.value)} required>
              {environments.map((environment) => <option key={environment.id} value={environment.id}>{environment.name}</option>)}
            </Select>
          </Field>
          <Field label="Categoria">
            <Input value={values.category} onChange={(e) => update("category", e.target.value)} placeholder="Cooktop, cuba, torneira..." />
          </Field>
          <Field label="Status">
            <Select value={values.status} onChange={(e) => update("status", e.target.value as ItemValues["status"])}>
              {ITEM_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </Select>
          </Field>
          <Field label="Marca">
            <Input value={values.brand} onChange={(e) => update("brand", e.target.value)} placeholder="Marca" />
          </Field>
          <Field label="Modelo">
            <Input value={values.model} onChange={(e) => update("model", e.target.value)} placeholder="Modelo" />
          </Field>
          <Field label="Código do produto">
            <Input value={values.productCode} onChange={(e) => update("productCode", e.target.value)} placeholder="SKU ou referência" />
          </Field>
          <Field label="Quantidade">
            <Input type="number" min="1" value={values.quantity} onChange={(e) => update("quantity", Number(e.target.value))} />
          </Field>
          <Field label="Medidas">
            <Input value={values.dimensions} onChange={(e) => update("dimensions", e.target.value)} placeholder="L × A × P ou medidas de recorte" />
          </Field>
          <Field label="Voltagem">
            <Input value={values.voltage} onChange={(e) => update("voltage", e.target.value)} placeholder="127V, 220V, bivolt..." />
          </Field>
          <Field label="Cor / acabamento">
            <Input value={values.finish} onChange={(e) => update("finish", e.target.value)} placeholder="Inox, preto, cromado..." />
          </Field>
          <Field label="Link do produto">
            <Input type="url" value={values.productUrl} onChange={(e) => update("productUrl", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Link do manual técnico">
            <Input type="url" value={values.manualUrl} onChange={(e) => update("manualUrl", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="URL da imagem">
            <Input type="url" value={values.imageUrl.startsWith("data:") ? "" : values.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
          </Field>
          <div className="sm:col-span-2">
            <Label>Imagem do produto</Label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 transition hover:border-sage hover:bg-sage/5">
              <ImagePlus className="h-5 w-5 text-sage-dark" />
              <span>{values.imageUrl ? "Trocar imagem do produto" : "Enviar uma imagem do computador"}</span>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
            </label>
          </div>
          <div className="sm:col-span-2">
            <Label>Pendência para marcenaria</Label>
            <Textarea value={values.carpentryPending} onChange={(e) => update("carpentryPending", e.target.value)} placeholder="Ex.: confirmar recorte, prever ventilação, validar afastamento..." />
          </div>
          <div className="sm:col-span-2">
            <Label>Observações</Label>
            <Textarea value={values.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Detalhes adicionais, recomendações de instalação..." />
          </div>
          <div className="sm:col-span-2">
            <Label>Requisitos técnicos</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Check label="Precisa de ponto elétrico" checked={values.needsElectrical} onChange={(checked) => update("needsElectrical", checked)} />
              <Check label="Precisa de ponto hidráulico" checked={values.needsPlumbing} onChange={(checked) => update("needsPlumbing", checked)} />
              <Check label="Precisa de nicho/recorte" checked={values.needsCutout} onChange={(checked) => update("needsCutout", checked)} />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="secondary"><Save className="h-4 w-4" /> Salvar item</Button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-medium text-ink">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#c96a43]" />
      {label}
    </label>
  );
}
