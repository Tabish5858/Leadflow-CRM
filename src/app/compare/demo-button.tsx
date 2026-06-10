"use client";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface DemoButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  label?: string;
}

export function DemoButton({
  label = "Try Live Demo",
  size = "lg",
  className = "gap-2",
  ...props
}: DemoButtonProps) {
  return (
    <Button
      size={size}
      className={`gap-1.5 ${className}`}
      onClick={() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("leadflow_demo_mode", "true");
          window.location.href = "/dashboard";
        }
      }}
      {...props}
    >
      <Zap className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
      {label}
    </Button>
  );
}
