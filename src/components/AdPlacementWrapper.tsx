import type { ReactNode } from "react";
import { isModuleEnabled } from "@/config/modules";

/**
 * Reserves a fixed slot for programmatic ads so CLS stays at 0.
 * When ADS module is off, renders nothing (no layout shift because we still
 * reserve nothing — placement is fully removed).
 */
export function AdPlacementWrapper({
  slot,
  height = 250,
  children,
}: {
  slot: string;
  height?: number;
  children?: ReactNode;
}) {
  if (!isModuleEnabled("ADS")) return null;
  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slot}
      className="mx-auto my-6 flex w-full max-w-3xl items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground"
      style={{ minHeight: height }}
    >
      {children ?? `ad · ${slot}`}
    </aside>
  );
}
