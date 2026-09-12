export const ITEM_STATUSES = [
  "A definir",
  "Escolhido",
  "Comprado",
  "Entregue",
  "Instalado",
] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];

export type EnvironmentIcon =
  | "kitchen"
  | "gourmet"
  | "laundry"
  | "bathroom"
  | "living"
  | "bedroom"
  | "home";

export interface Environment {
  extractedRoomId?: string;
  id: string;
  name: string;
  description: string;
  icon: EnvironmentIcon;
  color: string;
  createdAt: string;
}

export interface ApartmentItem {
  sceneObjectId?: string;
  structuredDimensions?: { width?: import("./domain/schemas").ExtractedFact; height?: import("./domain/schemas").ExtractedFact; depth?: import("./domain/schemas").ExtractedFact; };
  id: string;
  environmentId: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  productCode: string;
  quantity: number;
  dimensions: string;
  voltage: string;
  finish: string;
  productUrl: string;
  manualUrl: string;
  notes: string;
  status: ItemStatus;
  imageUrl: string;
  favorite: boolean;
  carpentryPending: string;
  needsElectrical: boolean;
  needsPlumbing: boolean;
  needsCutout: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  environments: Environment[];
  items: ApartmentItem[];
}

export type UserRole = "admin" | "client";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  /** Somente demonstração legada; nunca retornado pelo servidor. */
  password?: string;
  passwordHash?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export type ProjectStatus = "Coleta de dados" | "Em revisão" | "Concluído" | import("./domain/schemas").ProjectState;

export interface ClientProject {
  organizationId?: string;
  id: string;
  name: string;
  clientId: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface PlatformData {
  users: PlatformUser[];
  projects: ClientProject[];
}

export interface SessionData {
  userId: string;
}
