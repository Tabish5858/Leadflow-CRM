"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

type HeaderActionsContextValue = {
  setHeaderActions: (actions: ReactNode | null) => void;
};

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(null);

export function HeaderActionsProvider({
  children,
  setHeaderActions,
}: {
  children: ReactNode;
  setHeaderActions: (actions: ReactNode | null) => void;
}) {
  return (
    <HeaderActionsContext.Provider value={{ setHeaderActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  const ctx = useContext(HeaderActionsContext);
  if (!ctx) {
    throw new Error("useHeaderActions must be used within HeaderActionsProvider");
  }
  return ctx;
}
