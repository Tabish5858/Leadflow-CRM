"use client";

import { useEffect, useState } from "react";
import { getLead } from "@/lib/firebase/firestore";
import type { Lead } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadStore } from "@/lib/stores/leadStore";
import { DEFAULT_PIPELINE_STAGES } from "@/lib/constants";
import { cn, formatDate, formatCurrency, getInitials } from "@/lib/utils";
import {
  Mail,
  Phone,
  Building2,
  Globe,
  Linkedin,
  MapPin,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface LeadDetailProps {
  leadId: string;
}

export function LeadDetail({ leadId }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const updateStatus = useLeadStore((s) => s.updateStatus);

  useEffect(() => {
    setLoading(true);
    getLead(leadId).then((data) => {
      setLead(data);
      setLoading(false);
    });
  }, [leadId]);

  const handleStatusChange = (status: string) => {
    if (!lead) return;
    updateStatus(lead.id, status);
    setLead({ ...lead, status });
    toast.success(`Moved to ${DEFAULT_PIPELINE_STAGES.find((s) => s.id === status)?.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return <p className="text-center text-muted-foreground py-12">Lead not found</p>;
  }

  const statusStage = DEFAULT_PIPELINE_STAGES.find((s) => s.id === lead.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">
            {getInitials(`${lead.firstName} ${lead.lastName}`)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">
            {lead.firstName} {lead.lastName}
          </h2>
          {lead.jobTitle && (
            <p className="text-muted-foreground">
              {lead.jobTitle} {lead.company ? `at ${lead.company}` : ""}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={cn(
                statusStage?.id === "won"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : statusStage?.id === "lost"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              )}
            >
              {statusStage?.name || lead.status}
            </Badge>
            {lead.value && (
              <Badge variant="outline">
                {formatCurrency(lead.value, lead.currency)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Status Change */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Move to:</span>
        <Select value={lead.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{lead.email}</p>
          </div>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{lead.phone}</p>
            </div>
          </div>
        )}
        {lead.company && (
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="text-sm font-medium">{lead.company}</p>
            </div>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Website</p>
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {lead.website}
              </a>
            </div>
          </div>
        )}
        {lead.linkedin && (
          <div className="flex items-center gap-3">
            <Linkedin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">LinkedIn</p>
              <a
                href={lead.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Profile
              </a>
            </div>
          </div>
        )}
        {(lead.city || lead.country) && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">
                {lead.city}
                {lead.city && lead.country ? ", " : ""}
                {lead.country}
              </p>
            </div>
          </div>
        )}
        {lead.value && (
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Deal Value</p>
              <p className="text-sm font-medium">
                {formatCurrency(lead.value, lead.currency)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {lead.notes && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {lead.notes}
            </p>
          </div>
        </>
      )}

      {/* Tags */}
      {lead.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Metadata */}
      <Separator />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Created: {formatDate(lead.createdAt?.toDate())}</p>
        <p>Updated: {formatDate(lead.updatedAt?.toDate())}</p>
      </div>
    </div>
  );
}
