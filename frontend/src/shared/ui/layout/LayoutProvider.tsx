import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useWindowDimensions } from "react-native";
import { layoutFor, type LayoutInfo } from "./layout";

const LayoutContext = createContext<LayoutInfo | null>(null);

export function LayoutProvider({
  width,
  children,
}: {
  width?: number;
  children: ReactNode;
}) {
  const windowDims = useWindowDimensions();
  const effectiveWidth = width ?? windowDims?.width ?? 360;

  const value = useMemo(() => layoutFor(effectiveWidth), [effectiveWidth]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout(): LayoutInfo {
  const context = useContext(LayoutContext);
  const windowDims = useWindowDimensions();
  return context ?? layoutFor(windowDims?.width ?? 360);
}
