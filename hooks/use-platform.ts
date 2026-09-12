"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { localStorageRepository, platformRepository } from "@/lib/storage";
import type { ClientProject, PlatformData, PlatformUser } from "@/lib/types";
import { demoPasswordHash } from "@/lib/demo-password";
import { uid } from "@/lib/utils";

export function usePlatform() {
  const [data, setData] = useState<PlatformData>({ users: [], projects: [] });
  const [sessionUserId, setSessionUserId] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = platformRepository.load();
    Promise.all(loaded.users.map(async user => {
      if (!user.password) return user;
      const { password, ...safe } = user;
      return { ...safe, passwordHash: await demoPasswordHash(password,user.id) };
    })).then(users => { setData({...loaded,users}); setHydrated(true); });
    setSessionUserId(platformRepository.loadSession()?.userId ?? "");
  }, []);

  useEffect(() => {
    if (hydrated) platformRepository.save(data);
  }, [data, hydrated]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === sessionUserId && user.active) ?? null,
    [data.users, sessionUserId],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = data.users.find(
        (entry) =>
          entry.active &&
          entry.email.toLowerCase() === normalizedEmail,
      );
      if (!user || (user.passwordHash ? user.passwordHash !== await demoPasswordHash(password,user.id) : user.password !== password)) return false;
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
    async (values: { name: string; email: string; password: string; projectName: string }) => {
      const timestamp = new Date().toISOString();
      const userId = uid("user");
      const user: PlatformUser = {
        id: userId,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        passwordHash: await demoPasswordHash(values.password,userId),
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
