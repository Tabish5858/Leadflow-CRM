"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClientUser } from "@/contexts/client-user-context";
import { db } from "@/lib/firebase/client";
import type { Invoice } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BackButton,
  ErrorState,
  SkeletonCard,
} from "@/components/client/module-layout";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

export default function ClientInvoiceDetailPage() {
  const params = useParams();
  const { clientWorkspaceId, uid } = useClientUser();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientWorkspaceId || !id) return;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, "invoices", id));
        if (!snap.exists()) {
          setError(new Error("Invoice not found"));
          return;
        }
        const data = { id: snap.id, ...snap.data() } as Invoice;
        // Verify client owns this invoice
        if (data.workspaceId !== clientWorkspaceId || data.clientId !== uid) {
          setError(new Error("You don't have access to this invoice"));
          return;
        }
        setInvoice(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, [clientWorkspaceId, id, uid]);

  if (loading) {
    return (
      <div>
        <BackButton href="/client/invoices" />
        <SkeletonCard className="mb-4" />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div>
        <BackButton href="/client/invoices" />
        <ErrorState
          message={error?.message || "Invoice not found"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div>
      <BackButton href="/client/invoices" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Issued{" "}
              {invoice.issueDate.toDate().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={STATUS_STYLES[invoice.status] || ""}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
            {invoice.pdfUrl && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Due Date</p>
              <p className="font-medium">
                {invoice.dueDate.toDate().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <p className="font-medium capitalize">{invoice.status}</p>
            </div>
            {invoice.paidDate && (
              <div>
                <p className="text-muted-foreground mb-1">Paid Date</p>
                <p className="font-medium">
                  {invoice.paidDate.toDate().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Unit Price</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(item.total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-1 text-sm ml-auto w-64">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax ({(invoice.taxRate * 100).toFixed(1)}%)
              </span>
              <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
