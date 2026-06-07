"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  GripVertical,
  Plus,
  FileText,
  DollarSign,
  ListChecks,
  Calendar,
  UserCheck,
  MessageSquareText,
} from "lucide-react";

interface SectionTemplate {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  content: string;
}

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "services",
    title: "Services",
    description: "List of services provided",
    icon: ListChecks,
    content: `
<h2>Services</h2>
<p>The Contractor agrees to provide the following services:</p>
<ul>
  <li>Service 1 — Description and scope</li>
  <li>Service 2 — Description and scope</li>
  <li>Service 3 — Description and scope</li>
</ul>
    `.trim(),
  },
  {
    id: "pricing",
    title: "Pricing Summary",
    description: "Cost and payment terms",
    icon: DollarSign,
    content: `
<h2>Pricing & Payment</h2>
<p>The total cost for the services described above is <strong>$X,XXX.XX</strong>.</p>
<p>Payment terms: <strong>Net 30</strong> from date of invoice.</p>
<table>
  <tr><th>Item</th><th>Amount</th></tr>
  <tr><td>Service Fee</td><td>$X,XXX.00</td></tr>
  <tr><td>Additional Costs</td><td>$XXX.00</td></tr>
  <tr><td><strong>Total</strong></td><td><strong>$X,XXX.00</strong></td></tr>
</table>
    `.trim(),
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Project milestones and dates",
    icon: Calendar,
    content: `
<h2>Project Timeline</h2>
<p>The project will be delivered according to the following schedule:</p>
<ul>
  <li><strong>Kickoff</strong> — Within 3 business days of signing</li>
  <li><strong>Milestone 1</strong> — [Date]</li>
  <li><strong>Milestone 2</strong> — [Date]</li>
  <li><strong>Final Delivery</strong> — [Date]</li>
</ul>
    `.trim(),
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    description: "Standard legal terms",
    icon: FileText,
    content: `
<h2>Terms & Conditions</h2>
<h3>1. Scope of Work</h3>
<p>The Contractor will perform the services described in this agreement professionally and in a timely manner.</p>
<h3>2. Payment</h3>
<p>All invoices are due within 30 days of receipt. Late payments may incur additional fees.</p>
<h3>3. Intellectual Property</h3>
<p>Upon full payment, all intellectual property rights for the deliverables shall transfer to the Client.</p>
<h3>4. Confidentiality</h3>
<p>Both parties agree to maintain confidentiality of proprietary information shared during this engagement.</p>
    `.trim(),
  },
  {
    id: "signatures-block",
    title: "Signature Block",
    description: "Standard signature section",
    icon: UserCheck,
    content: `
<h2>Agreement</h2>
<p>The parties hereto agree to the foregoing as evidenced by their signatures below.</p>
<p><strong>Contractor:</strong></p>
<p>Name: ___________________________</p>
<p>Date: ____________________________</p>
<p><strong>Client:</strong></p>
<p>Name: ___________________________</p>
<p>Date: ____________________________</p>
    `.trim(),
  },
  {
    id: "additional-notes",
    title: "Additional Notes",
    description: "Extra terms or notes",
    icon: MessageSquareText,
    content: `
<h2>Additional Notes</h2>
<ul>
  <li>Note 1</li>
  <li>Note 2</li>
  <li>Note 3</li>
</ul>
    `.trim(),
  },
];

interface ContractSectionsProps {
  onInsert: (html: string) => void;
}

export function ContractSections({ onInsert }: ContractSectionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Section Templates
        </p>
        <div className="space-y-1">
          {SECTION_TEMPLATES.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                onInsert(section.content);
                setOpen(false);
              }}
              className="w-full flex items-start gap-3 px-2 py-2 rounded-md text-left hover:bg-muted transition-colors"
            >
              <section.icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{section.title}</p>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
