"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AccentThemeProvider } from "@/contexts/accent-context";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <AccentThemeProvider>{children}</AccentThemeProvider>
    </NextThemesProvider>
  );
}
