"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientUser } from "@/contexts/client-user-context";
import { db } from "@/lib/firebase/client";
import type { ClientPortalSettings } from "@/types";
import { DEFAULT_CLIENT_PORTAL_SETTINGS } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Check, Save, Settings as SettingsIcon, User } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorState, PageHeader } from "@/components/client/module-layout";

const MODULE_LABELS: Record<string, string> = {
  projects: "Projects",
  messages: "Messages",
  meetings: "Meetings",
  invoices: "Invoices",
  documents: "Documents",
  time_tracking: "Time Tracking",
  project_requests: "Project Requests",
};

export default function ClientSettingsPage() {
  const {
    uid,
    displayName: initialName,
    email,
    photoURL,
    clientWorkspaceId,
    workspaceName,
  } = useClientUser();

  const [displayName, setDisplayName] = useState(initialName);
  const [portalSettings, setPortalSettings] = useState<ClientPortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Sync displayName when initialName changes
  useEffect(() => {
    setDisplayName(initialName);
  }, [initialName]);

  // Load portal settings
  useEffect(() => {
    if (!clientWorkspaceId) return;
    (async () => {
      try {
        const snap = await getDoc(
          doc(db, "client_portal_settings", clientWorkspaceId)
        );
        if (snap.exists()) {
          setPortalSettings(snap.data() as ClientPortalSettings);
        } else {
          setPortalSettings(DEFAULT_CLIENT_PORTAL_SETTINGS as ClientPortalSettings);
        }
      } catch {
        setPortalSettings(DEFAULT_CLIENT_PORTAL_SETTINGS as ClientPortalSettings);
      } finally {
        setLoading(false);
      }
    })();
  }, [clientWorkspaceId]);

  const handleSaveProfile = async () => {
    if (!displayName.trim() || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", uid), {
        displayName: displayName.trim(),
        updatedAt: new Date(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silently fail — user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      {error && <ErrorState message={error.message} />}

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={photoURL || undefined} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {displayName?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">
                Workspace: {workspaceName}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSaveProfile}
                disabled={saving || !displayName.trim()}
                className="gap-2"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : saving ? (
                  <Skeleton className="h-4 w-4" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portal Modules (read-only info) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4 text-primary" />
            Portal Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : portalSettings ? (
            <div className="space-y-2">
              {Object.entries(MODULE_LABELS).map(([key, label]) => {
                const enabled =
                  portalSettings.modules[key as keyof typeof portalSettings.modules] !== false;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm">{label}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        enabled
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Portal settings not configured. Contact your agency for assistance.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Workspace</span>
            <span>{workspaceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize">Client</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
