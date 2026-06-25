"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { localStorageRepository, platformRepository } from "@/lib/storage";
import type { ClientProject, PlatformData, PlatformUser } from "@/lib/types";
import { uid } from "@/lib/utils";

export function usePlatform() {
  const [data, setData] = useState<PlatformData>({ users: [], projects: [] });
  const [sessionUserId, setSessionUserId] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(platformRepository.load());
    setSessionUserId(platformRepository.loadSession()?.userId ?? "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) platformRepository.save(data);
  }, [data, hydrated]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === sessionUserId && user.active) ?? null,
    [data.users, sessionUserId],
  );

  const login = useCallback(
    (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = data.users.find(
        (entry) =>
          entry.active &&
          entry.email.toLowerCase() === normalizedEmail &&
          entry.password === password,
      );
      if (!user) return false;
      setSessionUserId(user.id);
      platformRepository.saveSession({ userId: user.id });
      return true;
    },
    [data.users],
  );

  const logout = useCallback(() => {
    setSessionUserId("");
    platformRepository.clearSession();
  }, []);

  const createClient = useCallback(
    (values: { name: string; email: string; password: string; projectName: string }) => {
      const timestamp = new Date().toISOString();
      const user: PlatformUser = {
        id: uid("user"),
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: "client",
        active: true,
        createdAt: timestamp,
      };
      const project: ClientProject = {
        id: uid("projeto"),
        name: values.projectName.trim(),
        clientId: user.id,
        status: "Coleta de dados",
        createdAt: timestamp,
      };
      localStorageRepository.create(project.id);
      setData((current) => ({
        users: [...current.users, user],
        projects: [...current.projects, project],
      }));
      return { user, project };
    },
    [],
  );

  const updateUser = useCallback((id: string, patch: Partial<PlatformUser>) => {
    setData((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === id ? { ...user, ...patch } : user)),
    }));
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<ClientProject>) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === id ? { ...project, ...patch } : project,
      ),
    }));
  }, []);

  return {
    hydrated,
    data,
    currentUser,
    login,
    logout,
    createClient,
    updateUser,
    updateProject,
  };
}
