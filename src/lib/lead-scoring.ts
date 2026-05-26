import type { Lead, PipelineStage } from "@/types";
import type { EmailRecord } from "@/lib/firebase/emails";

export interface ScoreBreakdown {
  dealValue: number;
  lastActivity: number;
  pipelineStage: number;
  emailEngagement: number;
  hasNotes: number;
  total: number;
}

export function calculateLeadScore(
  lead: Lead,
  emails: EmailRecord[],
  stages: PipelineStage[]
): ScoreBreakdown {
  // Deal value: 0-25 points
  let dealValue = 0;
  if (lead.value && lead.value > 0) {
    dealValue = Math.min(25, Math.round((lead.value / 10000) * 25));
  }

  // Last activity: 0-20 points
  let lastActivity = 0;
  if (lead.lastContactedAt) {
    const daysSinceContact =
      (Date.now() - lead.lastContactedAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceContact <= 7) {
      lastActivity = 20;
    } else if (daysSinceContact <= 30) {
      lastActivity = 10;
    }
  }

  // Pipeline stage: 0-20 points (based on stage position in array)
  let pipelineStage = 0;
  const stageIdx = stages.findIndex((s) => s.id === lead.status);
  if (stageIdx >= 0) {
    const maxIdx = Math.max(stages.length - 1, 1);
    pipelineStage = Math.round((stageIdx / maxIdx) * 20);
  }

  // Email engagement: 0-20 points (5+ emails = 20 points)
  const emailCount = emails.length;
  const emailEngagement = Math.min(20, Math.round((emailCount / 5) * 20));

  // Has notes: 0-15 points
  const hasNotes = lead.notes && lead.notes.trim().length > 0 ? 15 : 0;

  const total = dealValue + lastActivity + pipelineStage + emailEngagement + hasNotes;

  return {
    dealValue,
    lastActivity,
    pipelineStage,
    emailEngagement,
    hasNotes,
    total: Math.min(100, total),
  };
}

export function getScoreColor(score: number): string {
  if (score <= 25) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  if (score <= 50) return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
  if (score <= 75) return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
}

export function getScoreLabel(score: number): string {
  if (score <= 25) return "Low";
  if (score <= 50) return "Medium";
  if (score <= 75) return "High";
  return "Very High";
}
