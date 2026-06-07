"use client";

import { use, useEffect, useState } from "react";
import { SignatureModal } from "@/components/contracts/signature-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import {
  FileSignature,
  FileCheck,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Shield,
} from "lucide-react";

interface PublicContract {
  id: string;
  contractTitle: string;
  type: string;
  status: string;
  content: string;
  signers: Array<{
    id: string;
    name: string;
    email: string;
    title: string;
    type: string;
    status: string;
    required: boolean;
  }>;
  signatures: Array<{
    signer: string;
    signature: string;
    signedAt: number | null;
  }>;
  dateSent: number | null;
  dateSigned: number | null;
  createdAt: number | null;
}

function formatDate(ms: number | null) {
  if (!ms) return "-";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublicContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contract, setContract] = useState<PublicContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedSignerId, setSelectedSignerId] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/public/contracts/${id}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to load contract");
          return;
        }
        setContract(data.contract);

        // Record view
        await fetch(`/api/public/contracts/${id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ viewerName: "Public Viewer" }),
        }).catch(() => {});
      } catch {
        setError("Failed to load contract");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSign = async (signature: string) => {
    if (!contract || !selectedSignerId) return;
    setSigningIn(true);
    try {
      const res = await fetch(`/api/public/contracts/${contract.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerId: selectedSignerId,
          signature,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to sign");
        return;
      }

      toast.success("Document signed successfully!");
      setShowSignModal(false);
      // Reload to show updated status
      window.location.reload();
    } catch {
      toast.error("Failed to sign. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Contract Unavailable</h1>
            <p className="text-sm text-muted-foreground">{error || "This contract could not be found."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingSigners = contract.signers.filter((s) => s.status !== "signed");
  const allSigned = contract.status === "signed";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Secure document
          </div>
          <Badge variant="outline" className={`text-xs ${
            allSigned ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          }`}>
            {allSigned ? (contract.type === "proposal" ? "Approved" : "Signed") : "Pending Signature"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                {contract.type === "proposal" ? (
                  <FileCheck className="h-6 w-6 text-purple-500" />
                ) : (
                  <FileSignature className="h-6 w-6 text-blue-500" />
                )}
                <span className="text-sm font-medium capitalize text-muted-foreground">{contract.type}</span>
              </div>
              <h1 className="text-2xl font-bold">{contract.contractTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sent {formatDate(contract.dateSent)}
              </p>
            </div>

            {/* Document content */}
            <div className="border-t pt-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contract.content || "<p>No content.</p>" }}
              />
            </div>

            {/* Signature section */}
            <div className="border-t mt-8 pt-8">
              <h2 className="text-lg font-semibold mb-4">Signatures</h2>
              <div className="space-y-4">
                {contract.signers.map((signer) => {
                  const alreadySigned = signer.status === "signed";
                  const contractSig = contract.signatures.find((s) => s.signer === signer.id);

                  return (
                    <div
                      key={signer.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{signer.name || signer.email}</p>
                        <p className="text-sm text-muted-foreground">{signer.title}</p>
                        {alreadySigned && contractSig && (
                          <p className="text-sm text-green-600 mt-1">
                            <Check className="h-3.5 w-3.5 inline mr-1" />
                            Signed {formatDate(contractSig.signedAt)}
                          </p>
                        )}
                      </div>
                      {alreadySigned ? (
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900">
                          <Check className="h-3 w-3 mr-1" />
                          Signed
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedSignerId(signer.id);
                            setShowSignModal(true);
                          }}
                        >
                          <FileSignature className="h-4 w-4" />
                          Sign
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SignatureModal
        open={showSignModal}
        onClose={() => { if (!signingIn) setShowSignModal(false); }}
        onSign={handleSign}
        signerName={contract.signers.find((s) => s.id === selectedSignerId)?.name || "Signer"}
        title={contract.type === "proposal" ? "Approve Proposal" : "Sign Contract"}
        description={`Add your digital signature to this ${contract.type}.`}
      />
    </div>
  );
}
