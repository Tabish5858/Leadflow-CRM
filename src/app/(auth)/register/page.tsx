"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(cred.user, { displayName: formData.name });

      // Create user document
      await setDoc(doc(db, "users", cred.user.uid), {
        id: cred.user.uid,
        email: formData.email,
        displayName: formData.name,
        photoURL: null,
        role: "owner",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: "en",
        currency: "USD",
        notificationPrefs: {
          email: true,
          inApp: true,
          followUpReminders: true,
          digestFrequency: "daily",
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
      });

      // Create default workspace
      const workspaceId = cred.user.uid; // Use user ID as workspace ID for simplicity
      await setDoc(doc(db, "workspaces", workspaceId), {
        id: workspaceId,
        name: `${formData.name}'s Workspace`,
        logoUrl: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        weekStart: "monday",
        pipeline: {
          stages: [
            { id: "new", name: "New", color: "#3b82f6", probability: 0, order: 0 },
            { id: "contacted", name: "Contacted", color: "#eab308", probability: 10, order: 1 },
            { id: "qualified", name: "Qualified", color: "#f97316", probability: 25, order: 2 },
            { id: "proposal", name: "Proposal", color: "#a855f7", probability: 50, order: 3 },
            { id: "negotiation", name: "Negotiation", color: "#ef4444", probability: 75, order: 4 },
            { id: "won", name: "Won", color: "#22c55e", probability: 100, order: 5 },
            { id: "lost", name: "Lost", color: "#6b7280", probability: 0, order: 6 },
          ],
        },
        customFields: [],
        niches: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ownerId: cred.user.uid,
        memberIds: [cred.user.uid],
      });

      toast.success("Account created successfully");
      // Use setTimeout to ensure toast renders before navigation
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Get started with LeadFlow — it&apos;s free and open-source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
            <Button type="button" className="w-full" disabled={loading} onClick={handleRegister}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
