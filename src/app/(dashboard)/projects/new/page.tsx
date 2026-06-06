"use client";

import { useWorkspace } from "@/contexts/workspace-context";
import { createProject } from "@/lib/firebase/projects";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";
import type { WorkspaceMember } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";
import { Check, ChevronLeft, Loader2, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function todayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const { activeWorkspace, user } = useWorkspace();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [startDate, setStartDate] = useState(todayString());
  const [dueDate, setDueDate] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  // Auto-add owner/admin and set start date
  const ownerAdminIds = useMemo(() => {
    return members
      .filter((m) => m.role === "owner" || m.role === "admin")
      .map((m) => m.userId);
  }, [members]);

  // Pre-select owner/admin members on load
  useEffect(() => {
    if (ownerAdminIds.length > 0) {
      setSelectedMembers((prev) => {
        const next = new Set(prev);
        for (const id of ownerAdminIds) next.add(id);
        return next;
      });
    }
  }, [ownerAdminIds]);

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    getWorkspaceMembers(activeWorkspace.id)
      .then((m) => {
        setMembers(m);
      })
      .catch(() => toast.error("Failed to load members"))
      .finally(() => setLoading(false));
  }, [activeWorkspace?.id]);

  const toggleClient = (userId: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleMember = (userId: string) => {
    // Cannot remove owner/admin members
    if (ownerAdminIds.includes(userId)) return;
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !user?.id) return;
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setSubmitting(true);
    try {
      const id = await createProject(activeWorkspace.id, user.id, {
        name: name.trim(),
        description: description.trim() || null,
        status: "active",
        clients: [...selectedClients],
        memberIds: [...selectedMembers],
        priority: priority as "low" | "medium" | "high" | "urgent",
        budget: budget ? parseFloat(budget) : null,
        currency: "USD",
        startDate: startDate ? new Date(startDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      toast.success("Project created");
      router.push(`/projects/${id}`);
    } catch {
      toast.error("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientMembers = members.filter((m) => m.role === "client");
  const teamMembers = members.filter((m) => m.role !== "client");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>New Project</CardTitle>
            <CardDescription>Create a new project and assign team members and clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name + Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Brief description of the project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 10000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Team Member Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label>Team Members</Label>
                <span className="text-xs text-muted-foreground">
                  ({selectedMembers.size} selected)
                </span>
              </div>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No team members available.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {teamMembers.map((member) => {
                    const isSelected = selectedMembers.has(member.userId);
                    const isRequired = ownerAdminIds.includes(member.userId);
                    return (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => toggleMember(member.userId)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? "bg-primary/5 border-primary/20"
                            : "hover:bg-muted/30"
                        } ${isRequired ? "opacity-80" : ""}`}
                        title={isRequired ? "Owner/admin members are always included" : undefined}
                      >
                        <Avatar className="h-8 w-8 border shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(member.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate capitalize">{member.role}</p>
                        </div>
                        {isSelected ? (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded border shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Client Selection */}
            <div className="space-y-3">
              <Label>Assign Clients (optional)</Label>
              {clientMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No clients available. Invite clients to your workspace first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clientMembers.map((client) => {
                    const isSelected = selectedClients.has(client.userId);
                    return (
                      <button
                        key={client.userId}
                        type="button"
                        onClick={() => toggleClient(client.userId)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? "bg-primary/5 border-primary/20"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <Avatar className="h-8 w-8 border shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(client.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        </div>
                        {isSelected ? (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded border shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/projects">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
