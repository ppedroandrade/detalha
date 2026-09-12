"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { localStorageRepository } from "@/lib/storage";
import type { ApartmentItem, AppData, Environment } from "@/lib/types";
import { api } from "@/lib/api-client";
import { uid } from "@/lib/utils";

export function useApartmentData(projectId: string, persistent = false) {
  const [data, setData] = useState<AppData>({ environments: [], items: [] });
  const [hydrated, setHydrated] = useState(false);

  const [saving, setSaving] = useState(false);
  const [persistenceError, setPersistenceError] = useState("");
  const revision = useRef(0), baseline = useRef<AppData | null>(null);
  const queue = useRef(Promise.resolve()), failed = useRef(false);
  useEffect(() => {
    let active = true;
    if (!persistent) { const value = localStorageRepository.load(projectId); baseline.current=value; setData(value); setHydrated(true); return; }
    api<{data:AppData;revision:number}>(`/api/projects/${projectId}/data`).then(value => {
      if (!active) return;
      revision.current=value.revision; baseline.current=value.data; setData(value.data); setHydrated(true);
    }).catch(e => { if(active) setPersistenceError(e.message); });
    return () => { active=false; };
  }, [projectId, persistent]);
  useEffect(() => {
    if (!hydrated || data === baseline.current) return;
    if (!persistent) { localStorageRepository.save(projectId,data); return; }
    baseline.current=data;
    setSaving(true);
    queue.current=queue.current.then(async () => {
      if(failed.current) return;
      try {
        const value=await api<{revision:number}>(`/api/projects/${projectId}/data`,'PUT',{data,revision:revision.current});
        revision.current=value.revision; setPersistenceError("");
      } catch(e) { failed.current=true; setPersistenceError((e as Error).message + " As alterações não foram salvas. Mantenha esta tela aberta e copie o trabalho antes de recarregar."); }
    }).finally(()=>setSaving(false));
  }, [data, hydrated, projectId, persistent]);
  useEffect(() => {
    const handler=(event:BeforeUnloadEvent)=>{ if(saving || persistenceError) { event.preventDefault(); } };
    window.addEventListener('beforeunload',handler);
    return ()=>window.removeEventListener('beforeunload',handler);
  },[saving,persistenceError]);

  const addEnvironment = useCallback(
    (environment: Omit<Environment, "id" | "createdAt">) => {
      const created: Environment = {
        ...environment,
        id: uid("amb"),
        createdAt: new Date().toISOString(),
      };
      setData((current) => ({
        ...current,
        environments: [...current.environments, created],
      }));
      return created;
    },
    [],
  );

  const updateEnvironment = useCallback((environment: Environment) => {
    setData((current) => ({
      ...current,
      environments: current.environments.map((entry) =>
        entry.id === environment.id ? environment : entry,
      ),
    }));
  }, []);

  const deleteEnvironment = useCallback((id: string) => {
    setData((current) => ({
      environments: current.environments.filter((entry) => entry.id !== id),
      items: current.items.filter((entry) => entry.environmentId !== id),
    }));
  }, []);

  const saveItem = useCallback(
    (values: Omit<ApartmentItem, "id" | "createdAt" | "updatedAt">, id?: string) => {
      const timestamp = new Date().toISOString();
      setData((current) => {
        if (id) {
          return {
            ...current,
            items: current.items.map((entry) =>
              entry.id === id ? { ...entry, ...values, updatedAt: timestamp } : entry,
            ),
          };
        }
        return {
          ...current,
          items: [
            ...current.items,
            { ...values, id: uid("item"), createdAt: timestamp, updatedAt: timestamp },
          ],
        };
      });
    },
    [],
  );

  const patchItem = useCallback((id: string, patch: Partial<ApartmentItem>) => {
    setData((current) => ({
      ...current,
      items: current.items.map((entry) =>
        entry.id === id
          ? { ...entry, ...patch, updatedAt: new Date().toISOString() }
          : entry,
      ),
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      items: current.items.filter((entry) => entry.id !== id),
    }));
  }, []);

  const duplicateItem = useCallback((id: string) => {
    setData((current) => {
      const original = current.items.find((entry) => entry.id === id);
      if (!original) return current;
      const timestamp = new Date().toISOString();
      return {
        ...current,
        items: [
          ...current.items,
          {
            ...original,
            id: uid("item"),
            name: `${original.name} (cópia)`,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      };
    });
  }, []);

  const stats = useMemo(() => {
    const total = data.items.length;
    const installed = data.items.filter((item) => item.status === "Instalado").length;
    return {
      environments: data.environments.length,
      total,
      undecided: data.items.filter((item) => item.status === "A definir").length,
      purchased: data.items.filter((item) => item.status === "Comprado").length,
      installed,
      completion: total ? Math.round((installed / total) * 100) : 0,
    };
  }, [data]);

  return {
    data,
    hydrated,
    saving,
    persistenceError,
    stats,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
    saveItem,
    patchItem,
    deleteItem,
    duplicateItem,
  };
}
