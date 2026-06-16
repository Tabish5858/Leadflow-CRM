"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/contexts/workspace-context";
import { toast } from "@/lib/toast";
import { useCanCreateWorkspace } from "@/lib/hooks/use-can-create-workspace";
import {
  Building2,
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";

function getWorkspaceInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WorkspaceSwitcher({ collapsed = false, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const { workspaces, activeWorkspace, switchWorkspace, createNewWorkspace, user } = useWorkspace();
  const { canCreate } = useCanCreateWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Please enter a workspace name");
      return;
    }
    if (trimmed.length < 2) {
      toast.error("Workspace name must be at least 2 characters");
      return;
    }
    setCreating(true);
    try {
      await createNewWorkspace(trimmed);
      toast.success(`Workspace "${trimmed}" created`);
      setNewName("");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <>
      {/* Workspace Selector */}
      <div className="pt-3 px-3 flex justify-center items-center w-full">
        <DropdownMenu>
          {collapsed ? (
            <div className="relative group/ws">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  title={activeWorkspace.name}
                >
                  <Avatar className="h-8 w-8 border bg-primary/10">
                    <AvatarImage src={activeWorkspace.logoUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary h-9 w-9">
                      {getWorkspaceInitials(activeWorkspace.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer opacity-0 group-hover/ws:opacity-100 transition-opacity z-10 flex"
                  title="Expand sidebar"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center w-full gap-1 group">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2 px-2 h-10 text-sm font-medium hover:bg-accent/50"
                >
                  <Avatar className="h-9 w-9 border bg-primary/10">
                    <AvatarImage src={activeWorkspace.logoUrl || undefined} className="w-9 h-9"/>
                    <AvatarFallback className="text-xs bg-primary/10 text-primary h-9 w-9">
                      {getWorkspaceInitials(activeWorkspace.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-left">
                    {activeWorkspace.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors bg-accent text-foreground opacity-0 group-hover:opacity-100 absolute right-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <DropdownMenuContent
            className="w-64"
            align="start"
            side="right"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Workspaces
            </DropdownMenuLabel>

            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => switchWorkspace(workspace.id)}
                className="gap-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6 border bg-primary/10">
                  <AvatarImage src={workspace.logoUrl || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getWorkspaceInitials(workspace.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{workspace.name}</span>
                {workspace.id === activeWorkspace.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {canCreate && (
              <DropdownMenuItem
                onClick={() => setCreateOpen(true)}
                className="gap-2 cursor-pointer text-primary"
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator className="mt-2" />

      {/* Create Workspace Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create Workspace
            </DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your leads and team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace name</label>
              <Input
                placeholder="e.g., Acme Corp"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                autoFocus
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                This name will be visible to all members.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
