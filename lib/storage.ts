import type { AppData, PlatformData, SessionData } from "./types";
import { emptyProjectData, seedData } from "./seed";

const PROJECT_PREFIX = "marcenaria-projeto-v1";
const PLATFORM_KEY = "marcenaria-platform-v1";
const SESSION_KEY = "marcenaria-session-v1";
export const GABY_PROJECT_ID = "projeto-gaby";

export interface DataRepository {
  load(projectId: string): AppData;
  save(projectId: string, data: AppData): void;
  create(projectId: string): void;
}

export const localStorageRepository: DataRepository = {
  load(projectId) {
    if (typeof window === "undefined") return seedData;
    const stored = window.localStorage.getItem(`${PROJECT_PREFIX}:${projectId}`);
    if (!stored) return projectId === GABY_PROJECT_ID ? seedData : emptyProjectData;

    try {
      return JSON.parse(stored) as AppData;
    } catch {
      return projectId === GABY_PROJECT_ID ? seedData : emptyProjectData;
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
      email: "admin@morada.com",
      password: "admin123",
      role: "admin",
      active: true,
      createdAt,
    },
    {
      id: "user-gaby",
      name: "Gaby",
      email: "gaby@morada.com",
      password: "gaby123",
      role: "client",
      active: true,
      createdAt,
    },
  ],
  projects: [
    {
      id: GABY_PROJECT_ID,
      name: "Apartamento Gaby",
      clientId: "user-gaby",
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
