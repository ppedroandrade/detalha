"use client";

import { useState } from "react";
import type { ClientProject } from "@/lib/types";
import { usePlatform } from "@/hooks/use-platform";
import { AdminDashboard } from "./admin-dashboard";
import { ApartmentApp } from "./apartment-app";
import { LoginScreen } from "./login-screen";

export function PlatformApp() {
  const platform = usePlatform();
  const [adminProject, setAdminProject] = useState<ClientProject | null>(null);

  if (!platform.hydrated) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm font-medium text-slate-500">Carregando o portal...</div>;
  }

  if (!platform.currentUser) {
    return <LoginScreen onLogin={platform.login} />;
  }

  if (platform.currentUser.role === "admin" && !adminProject) {
    return (
      <AdminDashboard
        data={platform.data}
        admin={platform.currentUser}
        onOpenProject={setAdminProject}
        onCreateClient={platform.createClient}
        onUpdateUser={platform.updateUser}
        onUpdateProject={platform.updateProject}
        onLogout={platform.logout}
      />
    );
  }

  const project =
    adminProject ??
    platform.data.projects.find((entry) => entry.clientId === platform.currentUser?.id);

  if (!project) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-slate-500">Nenhum projeto vinculado a este usuário.</div>;
  }

  return (
    <ApartmentApp
      key={project.id}
      project={project}
      user={platform.currentUser}
      onLogout={platform.logout}
      onBackToAdmin={
        platform.currentUser.role === "admin" ? () => setAdminProject(null) : undefined
      }
    />
  );
}
