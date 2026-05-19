"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { useLeadStore } from "@/lib/stores/leadStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadDetail } from "@/components/leads/lead-detail";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Trash2,
  Loader2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { cn, formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { DEFAULT_PIPELINE_STAGES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  qualified: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  proposal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  negotiation: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  lost: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function LeadsPage() {
  const [user, setUser] = useState<string | null>(null);
  const [workspaceId] = useState("default"); // MVP: single workspace
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    leads,
    filteredLeads,
    loading,
    searchQuery,
    selectedIds,
    setSearchQuery,
    toggleSelect,
    selectAll,
    clearSelection,
    removeLeads,
    initialize,
    refreshStats,
  } = useLeadStore();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u.uid);
        initialize(workspaceId);
        refreshStats(workspaceId);
      }
    });
    return () => unsub();
  }, [workspaceId, initialize, refreshStats]);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    try {
      await removeLeads(Array.from(selectedIds));
      clearSelection();
      toast.success(`${count} lead${count > 1 ? "s" : ""} deleted`);
    } catch {
      toast.error("Failed to delete leads");
    }
  };

  const handleStatusChange = (leadId: string, status: string) => {
    useLeadStore.getState().updateStatus(leadId, status);
    toast.success("Status updated");
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    toast.success("Lead created successfully");
  };

  const filteredByStatus =
    statusFilter === "all"
      ? filteredLeads
      : filteredLeads.filter((l) => l.status === statusFilter);

  const allSelected =
    filteredByStatus.length > 0 &&
    filteredByStatus.every((l) => selectedIds.has(l.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            {leads.length} total lead{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {DEFAULT_PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-12 p-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={allSelected ? clearSelection : selectAll}
                  />
                </th>
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium hidden md:table-cell">
                  Company
                </th>
                <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">
                  Status
                </th>
                <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">
                  Value
                </th>
                <th className="text-left p-3 text-sm font-medium hidden xl:table-cell">
                  Created
                </th>
                <th className="w-12 p-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading leads...
                    </p>
                  </td>
                </tr>
              ) : filteredByStatus.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No leads found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : "Add your first lead to get started"}
                    </p>
                    {!searchQuery && (
                      <Button
                        className="mt-4"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredByStatus.map((lead) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 cursor-pointer",
                      selectedIds.has(lead.id) && "bg-muted"
                    )}
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(lead.id)}
                        onCheckedChange={() => toggleSelect(lead.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(`${lead.firstName} ${lead.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm hidden md:table-cell">
                      {lead.company || "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className={cn(
                          STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-800"
                        )}
                      >
                        {DEFAULT_PIPELINE_STAGES.find((s) => s.id === lead.status)
                          ?.name || lead.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm hidden lg:table-cell">
                      {lead.value ? formatCurrency(lead.value, lead.currency) : "—"}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground hidden xl:table-cell">
                      {formatDate(lead.createdAt?.toDate())}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLead(lead.id)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {DEFAULT_PIPELINE_STAGES.filter(
                            (s) => s.id !== lead.status
                          ).map((stage) => (
                            <DropdownMenuItem
                              key={stage.id}
                              onClick={() => handleStatusChange(lead.id, stage.id)}
                            >
                              Move to {stage.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSuccess={handleCreateSuccess}
            userId={user || ""}
            workspaceId={workspaceId}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLead && <LeadDetail leadId={selectedLead} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
