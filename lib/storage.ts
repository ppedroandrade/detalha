import type { AppData, PlatformData, SessionData } from "./types";
import { emptyProjectData, seedData } from "./seed";

const PROJECT_PREFIX = "marcenaria-projeto-v1";
const PLATFORM_KEY = "marcenaria-platform-v1";
const SESSION_KEY = "marcenaria-session-v1";
export const DEMO_PROJECT_ID = "projeto-demo";

export interface DataRepository {
  load(projectId: string): AppData;
  save(projectId: string, data: AppData): void;
  create(projectId: string): void;
}

export const localStorageRepository: DataRepository = {
  load(projectId) {
    if (typeof window === "undefined") return seedData;
    const stored = window.localStorage.getItem(`${PROJECT_PREFIX}:${projectId}`);
    if (!stored) return projectId === DEMO_PROJECT_ID ? seedData : emptyProjectData;

    try {
      return JSON.parse(stored) as AppData;
    } catch {
      return projectId === DEMO_PROJECT_ID ? seedData : emptyProjectData;
    }
  },
  save(projectId, data) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`${PROJECT_PREFIX}:${projectId}`, JSON.stringify(data));
    }
  },
  create(projectId) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        `${PROJECT_PREFIX}:${projectId}`,
        JSON.stringify(structuredClone(emptyProjectData)),
      );
    }
  },
};

const createdAt = "2026-06-25T12:00:00.000Z";

export const initialPlatformData: PlatformData = {
  users: [
    {
      id: "user-admin",
      name: "Administrador Marcenaria",
      email: "admin@example.invalid",
      passwordHash: "60a702a5cf5f8d1310dc9447a0b1d689dc1c1f98c2acadd4b2a6d653c084f342",
      role: "admin",
      active: true,
      createdAt,
    },
    {
      id: "user-demo",
      name: "Cliente demonstração",
      email: "cliente@example.invalid",
      passwordHash: "e84ce7e669a6562671b1247ea6d35f2fc6725533150698132befd70ed86b1b83",
      role: "client",
      active: true,
      createdAt,
    },
  ],
  projects: [
    {
      id: DEMO_PROJECT_ID,
      name: "Apartamento fictício",
      clientId: "user-demo",
      status: "Coleta de dados",
      createdAt,
    },
  ],
};

export const platformRepository = {
  load(): PlatformData {
    if (typeof window === "undefined") return initialPlatformData;
    const stored = window.localStorage.getItem(PLATFORM_KEY);
    if (!stored) return initialPlatformData;
    try {
      return JSON.parse(stored) as PlatformData;
    } catch {
      return initialPlatformData;
    }
  },
  save(data: PlatformData) {
    window.localStorage.setItem(PLATFORM_KEY, JSON.stringify(data));
  },
  loadSession(): SessionData | null {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as SessionData;
    } catch {
      return null;
    }
  },
  saveSession(session: SessionData) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
  },
};
