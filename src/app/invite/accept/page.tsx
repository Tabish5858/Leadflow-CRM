"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { acceptInvite, getWorkspace } from "@/lib/firebase/workspaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import Link from "next/link";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "accepting" | "success" | "error" | "not-logged-in">("loading");
  const [message, setMessage] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const inviteId = searchParams.get("inviteId");

  useEffect(() => {
    if (authLoading) return;

    if (!inviteId) {
      setStatus("error");
      setMessage("Invalid invitation link. No invite ID provided.");
      return;
    }

    if (!firebaseUser) {
      // Redirect to login with callback
      const callback = encodeURIComponent(`/invite/accept?inviteId=${inviteId}`);
      router.push(`/login?redirect=${callback}`);
      return;
    }

    const userId = firebaseUser.uid;

    async function accept() {
      setStatus("accepting");
      try {
        // Get workspace name for display
        const inviteDoc = await getInviteDetails(inviteId!);
        if (inviteDoc?.workspaceId) {
          const workspace = await getWorkspace(inviteDoc.workspaceId);
          if (workspace) setWorkspaceName(workspace.name);
        }

        await acceptInvite(inviteId!, userId);
        setStatus("success");
        setMessage("You've successfully joined the workspace!");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Failed to accept invitation.");
      }
    }

    accept();
  }, [authLoading, firebaseUser, inviteId, router]);

  if (authLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "not-logged-in") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">Sign in to accept invitation</CardTitle>
            <CardDescription>
              You need to be logged in to accept this workspace invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button asChild>
              <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "accepting" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <CardTitle className="mt-4">Accepting Invitation</CardTitle>
              <CardDescription>
                {workspaceName ? `Joining ${workspaceName}...` : "Please wait..."}
              </CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="mt-4">Welcome to {workspaceName}!</CardTitle>
              <CardDescription>{message}</CardDescription>
              <CardDescription className="mt-2">
                Redirecting to dashboard...
              </CardDescription>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="mt-4">Invitation Error</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === "error" && (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getInviteDetails(inviteId: string): Promise<{ workspaceId: string } | null> {
  const { doc, getDoc } = await import("firebase/firestore");
  const { db } = await import("@/lib/firebase/client");
  const inviteRef = doc(db, "workspace_invites", inviteId);
  const snap = await getDoc(inviteRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return { workspaceId: data.workspaceId };
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
