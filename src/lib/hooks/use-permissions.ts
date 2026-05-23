"use client";

import { useWorkspace } from "@/contexts/workspace-context";
import { getEffectivePermissions, canAccessModule } from "@/lib/permissions";
import type { ModuleId } from "@/types";

/**
 * Hook that returns the effective permissions for the current user in the active workspace.
 */
export function usePermissions() {
  const { user, activeWorkspace } = useWorkspace();

  const role = user?.role || "viewer";
  const perms = getEffectivePermissions(
    activeWorkspace?.modulePermissions || null,
    role
  );

  const canAccess = (moduleId: ModuleId): boolean =>
    canAccessModule(activeWorkspace?.modulePermissions || null, role, moduleId);

  return { permissions: perms, canAccess, role };
}
