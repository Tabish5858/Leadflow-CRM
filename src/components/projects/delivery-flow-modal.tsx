"use client";

import { useState } from "react";
import type { Deliverable, DeliverableFileAttachment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { updateDeliveryProgress } from "@/lib/firebase/project-deliverables";
import { getApiAuthHeaders } from "@/lib/api/client";
import { formatFileSize } from "@/lib/documents";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Package, Star, MessageSquare, Share2, ShoppingCart, CheckCircle2, Download, Eye, ChevronLeft, ChevronRight, ThumbsUp,
  FileText, File, Image as ImageIcon, Video,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "package" | "feedback" | "referrals" | "review" | "upsell" | "complete";

interface DeliveryFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverables: Deliverable[];
  projectId: string;
  workspaceId: string;
  userId: string;
}

// ─── Package Step ────────────────────────────────────────────────────────────

function PackageStep({ deliverables, onContinue }: { deliverables: Deliverable[]; onContinue: () => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const getUrl = (f: DeliverableFileAttachment) => f.cloudinaryUrl || f.filePath;
  const totalFiles = deliverables.reduce((a, d) => a + d.versions.reduce((b, v) => b + v.files.length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
        <Package className="h-10 w-10 mx-auto text-success mb-2" />
        <p className="text-sm font-medium text-success">Your Final Package is Ready!</p>
        <p className="text-xs text-muted-foreground mt-1">{deliverables.length} deliverables · {totalFiles} files</p>
      </div>

      <div className="space-y-2">
        {deliverables.map((del) => {
          const isExpanded = expanded.has(del.id);
          return (
            <div key={del.id} className="border rounded-lg overflow-hidden">
              <button className="w-full flex items-center justify-between p-3 text-sm hover:bg-accent/30" onClick={() => {
                setExpanded((prev) => { const n = new Set(prev); if (n.has(del.id)) n.delete(del.id); else n.add(del.id); return n; });
              }}>
                <span className="font-medium">{del.title}</span>
                <span className="text-xs text-muted-foreground">{del.versions.length} version{del.versions.length !== 1 ? "s" : ""}</span>
              </button>
              {isExpanded && del.versions.map((v) => (
                <div key={v.id} className="border-t px-3 py-2 pl-8 space-y-1">
                  <p className="text-xs font-medium">Version {v.versionNumber}</p>
                  {v.files.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-xs">
                      {f.mimeType?.startsWith("image/") ? <ImageIcon className="h-3 w-3" /> :
                       f.mimeType?.startsWith("video/") ? <Video className="h-3 w-3" /> :
                       <FileText className="h-3 w-3" />}
                      <span className="flex-1 truncate">{f.fileName || f.originalName}</span>
                      <span className="text-muted-foreground">{formatFileSize(f.fileSize)}</span>
                      <a href={getUrl(f)} download={f.fileName} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Button className="w-full" onClick={onContinue}>Continue</Button>
    </div>
  );
}

// ─── Feedback Step ───────────────────────────────────────────────────────────

function FeedbackStep({ onContinue, onBack }: { onContinue: (data: { rating: number; recommendation: number; testimonialPermission: boolean }) => void; onBack: () => void }) {
  const [rating, setRating] = useState(0);
  const [recommendation, setRecommendation] = useState<number>(0);
  const [testimonialPermission, setTestimonialPermission] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Star className="h-10 w-10 mx-auto text-primary mb-2" />
        <p className="text-sm font-medium">How was your experience?</p>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-sm">Rating</Label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}
              className={cn("w-10 h-10 rounded-full text-lg transition-all", n <= rating ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="space-y-2">
        <Label className="text-sm">Would you recommend us?</Label>
        <div className="flex gap-2">
          {[
            { value: 1, label: "Yes", icon: ThumbsUp },
            { value: 0, label: "Maybe", icon: MessageSquare },
            { value: -1, label: "No", icon: ThumbsUp },
          ].map((opt) => (
            <button key={opt.value} onClick={() => setRecommendation(opt.value)}
              className={cn("flex-1 py-2 rounded-lg text-sm border transition-all", recommendation === opt.value ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted/50")}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonial Permission */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={testimonialPermission} onChange={(e) => setTestimonialPermission(e.target.checked)}
          className="h-4 w-4 rounded border-primary text-primary" />
        I&apos;m willing to provide a testimonial
      </label>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button className="flex-1" onClick={() => onContinue({ rating, recommendation, testimonialPermission })} disabled={rating === 0}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Referrals Step ──────────────────────────────────────────────────────────

function ReferralsStep({ onContinue, onBack }: { onContinue: (data: { message: string }) => void; onBack: () => void }) {
  const [message, setMessage] = useState(
    "I just received my final deliverables and wanted to share my experience working with this team. They did an amazing job!"
  );

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Share2 className="h-10 w-10 mx-auto text-primary mb-2" />
        <p className="text-sm font-medium">Refer a Friend</p>
        <p className="text-xs text-muted-foreground">Share a custom message with your referrals.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Referral Message</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="text-sm" />
      </div>

      <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Share this link:</p>
        <div className="flex gap-2">
          <Input value={typeof window !== "undefined" ? window.location.origin + "/refer" : ""} readOnly className="text-xs h-8" />
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
            navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.origin + "/refer" : "");
            toast.success("Link copied!");
          }}>Copy</Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button className="flex-1" onClick={() => onContinue({ message })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Review Step ─────────────────────────────────────────────────────────────

const REVIEW_PLATFORMS = [
  { id: "google", name: "Google", url: "https://g.co/kgs/" },
  { id: "trustpilot", name: "Trustpilot", url: "https://trustpilot.com/review/" },
  { id: "facebook", name: "Facebook", url: "https://facebook.com/" },
  { id: "yelp", name: "Yelp", url: "https://yelp.com/" },
  { id: "g2", name: "G2", url: "https://g2.com/" },
  { id: "clutch", name: "Clutch", url: "https://clutch.co/" },
];

function ReviewStep({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Star className="h-10 w-10 mx-auto text-primary mb-2" />
        <p className="text-sm font-medium">Leave a Review</p>
        <p className="text-xs text-muted-foreground">Help others by sharing your experience.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {REVIEW_PLATFORMS.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors text-sm">
            <Star className="h-4 w-4 text-primary shrink-0" />
            <span>{p.name}</span>
          </a>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button className="flex-1" onClick={onContinue}>
          Skip this step <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Upsell Step ─────────────────────────────────────────────────────────────

function UpsellStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <ShoppingCart className="h-10 w-10 mx-auto text-primary mb-2" />
        <p className="text-sm font-medium">Interested in more?</p>
        <p className="text-xs text-muted-foreground">We offer additional services to help you grow.</p>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Contact us to discuss additional services:</p>
        <Button variant="default" size="sm" asChild>
          <a href="mailto:support@leadflow.com">Get in Touch</a>
        </Button>
      </div>

      <Button className="w-full" onClick={onContinue}>
        Complete <CheckCircle2 className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// ─── Completion Step ─────────────────────────────────────────────────────────

function CompletionStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4 text-center py-4">
      <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
      <p className="text-lg font-semibold">Thank You!</p>
      <p className="text-sm text-muted-foreground">Your feedback has been received. We appreciate your time!</p>
      <Button className="mt-4" onClick={onClose}>Done</Button>
    </div>
  );
}

// ─── Main Delivery Flow Modal ────────────────────────────────────────────────

export function DeliveryFlowModal({ isOpen, onClose, deliverables, projectId, workspaceId, userId }: DeliveryFlowModalProps) {
  const [step, setStep] = useState<Step>("package");
  const [feedbackData, setFeedbackData] = useState<{ rating: number; recommendation: number; testimonialPermission: boolean } | null>(null);

  const handleStepComplete = async (nextStep: Step) => {
    try {
      await updateDeliveryProgress(deliverables[0]?.id || "", step);
    } catch { /* non-critical */ }
    setStep(nextStep);
  };

  const handleClose = () => {
    setStep("package");
    setFeedbackData(null);
    onClose();
  };

  // If no deliverables, just show a success screen
  if (deliverables.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delivery Complete</DialogTitle>
            <DialogDescription>Thank you for your business!</DialogDescription>
          </DialogHeader>
          <CompletionStep onClose={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "package" && "Your Final Package"}
            {step === "feedback" && "Share Your Feedback"}
            {step === "referrals" && "Refer a Friend"}
            {step === "review" && "Leave a Review"}
            {step === "upsell" && "Additional Services"}
            {step === "complete" && "All Done!"}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {["package", "feedback", "referrals", "review", "upsell"].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={cn("w-2.5 h-2.5 rounded-full", step === s ? "bg-primary" : ["complete", "upsell"].includes(step) && ["package", "feedback", "referrals", "review", "upsell"].indexOf(s) <= ["package", "feedback", "referrals", "review", "upsell"].indexOf(step) ? "bg-success" : "bg-muted")} />
              {i < 4 && <div className={cn("w-6 h-0.5", step === s || (["complete", "upsell"].includes(step) && s !== "upsell") ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>

        {step === "package" && <PackageStep deliverables={deliverables} onContinue={() => handleStepComplete("feedback")} />}
        {step === "feedback" && (
          <FeedbackStep
            onContinue={(data) => { setFeedbackData(data); handleStepComplete("referrals"); }}
            onBack={() => handleStepComplete("package")}
          />
        )}
        {step === "referrals" && (
          <ReferralsStep
            onContinue={() => handleStepComplete("review")}
            onBack={() => handleStepComplete("feedback")}
          />
        )}
        {step === "review" && (
          <ReviewStep
            onContinue={() => handleStepComplete("upsell")}
            onBack={() => handleStepComplete("referrals")}
          />
        )}
        {step === "upsell" && (
          <UpsellStep onContinue={() => handleStepComplete("complete")} />
        )}
        {step === "complete" && <CompletionStep onClose={handleClose} />}
      </DialogContent>
    </Dialog>
  );
}
