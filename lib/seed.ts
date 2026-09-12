import type { ApartmentItem, AppData, Environment, ItemStatus } from "./types";

const now = new Date("2026-06-24T12:00:00.000Z").toISOString();

export const seedEnvironments: Environment[] = [
  { id: "sala", name: "Sala", description: "TV, áudio, games e equipamentos da sala", icon: "living", color: "#B08A5B", createdAt: now },
  { id: "cozinha", name: "Cozinha", description: "Eletrodomésticos, metais e itens da cozinha", icon: "kitchen", color: "#C96A43", createdAt: now },
  { id: "lavanderia", name: "Lavanderia", description: "Equipamentos e metais da lavanderia", icon: "laundry", color: "#6B84A8", createdAt: now },
  { id: "suite-master", name: "Suíte master", description: "Equipamentos e mobiliário da suíte", icon: "bedroom", color: "#A16F78", createdAt: now },
  { id: "closet", name: "Closet", description: "Equipamentos e itens pessoais do closet", icon: "bedroom", color: "#8A7DA8", createdAt: now },
  { id: "escritorio", name: "Escritório", description: "Computadores, monitores e equipamentos do escritório", icon: "home", color: "#4D7066", createdAt: now },
  { id: "gourmet", name: "Área gourmet", description: "Cuba, bebidas e metais da área gourmet", icon: "gourmet", color: "#6F8F84", createdAt: now },
];

const item = (
  id: string,
  environmentId: string,
  name: string,
  category: string,
  status: ItemStatus,
  extras: Partial<ApartmentItem> = {},
): ApartmentItem => ({
  id,
  environmentId,
  name,
  category,
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
  status,
  imageUrl: "",
  favorite: false,
  carpentryPending: "",
  needsElectrical: false,
  needsPlumbing: false,
  needsCutout: false,
  createdAt: now,
  updatedAt: now,
  ...extras,
});

// Exemplos fictícios: sem dimensões ou especificações de clientes reais.
export const seedItems: ApartmentItem[] = [
  item("demo-refrigerador", "cozinha", "Refrigerador demonstrativo", "Eletrodoméstico", "A definir", {
    notes: "Exemplo fictício. Anexe a ficha técnica para preencher as especificações.",
    carpentryPending: "Confirmar dimensões e ventilação no documento do fabricante.",
    needsElectrical: true,
  }),
  item("demo-cuba", "cozinha", "Cuba demonstrativa", "Metais", "Escolhido", {
    notes: "Exemplo fictício sem marca ou modelo comercial.",
    needsPlumbing: true, needsCutout: true,
  }),
  item("demo-armario", "sala", "Armário demonstrativo", "Móvel", "A definir", {
    carpentryPending: "Medidas ausentes; não liberado para fabricação.",
  }),
];

export const seedData: AppData = {
  environments: seedEnvironments,
  items: seedItems,
};

export const emptyProjectData: AppData = {
  environments: [
    { id: "cozinha", name: "Cozinha", description: "Eletros e metais da cozinha", icon: "kitchen", color: "#C96A43", createdAt: now },
    { id: "gourmet", name: "Área gourmet", description: "Itens da área gourmet", icon: "gourmet", color: "#6F8F84", createdAt: now },
    { id: "lavanderia", name: "Lavanderia", description: "Equipamentos da lavanderia", icon: "laundry", color: "#6B84A8", createdAt: now },
    { id: "sala", name: "Sala", description: "Eletrônicos e itens da sala", icon: "living", color: "#B08A5B", createdAt: now },
    { id: "suite", name: "Suíte", description: "Itens da suíte", icon: "bedroom", color: "#A16F78", createdAt: now },
  ],
  items: [],
};
