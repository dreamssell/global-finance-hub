import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import { logAnalyticsEvent } from "@/lib/analytics.functions";
import { isModuleEnabled } from "@/config/modules";

function sessionId() {
  if (typeof window === "undefined") return null;
  const k = "app.sid";
  let s = window.sessionStorage.getItem(k);
  if (!s) { s = crypto.randomUUID(); window.sessionStorage.setItem(k, s); }
  return s;
}

export function HeatmapTracker({ country }: { country: string | null }) {
  const { locale } = useI18n();
  const sent = useRef(false);

  useEffect(() => {
    if (!isModuleEnabled("HEATMAP_TRACKER")) return;
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    const sid = sessionId();

    if (!sent.current) {
      sent.current = true;
      logAnalyticsEvent({
        data: { event_type: "pageview", path, country, locale, session_id: sid },
      }).catch(() => {});
    }

    let maxDepth = 0;
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();
    let lastClick = 0;

    const emitScroll = (depth: number) => {
      logAnalyticsEvent({
        data: { event_type: "scroll", path, country, locale, session_id: sid, scroll_depth: depth },
      }).catch(() => {});
    };

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const d = h > 0
        ? Math.min(100, Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100))
        : 100;
      if (d > maxDepth) maxDepth = d;
      for (const m of milestones) {
        if (d >= m && !reached.has(m)) {
          reached.add(m);
          emitScroll(m);
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastClick < 250) return; // throttle spam
      lastClick = now;
      logAnalyticsEvent({
        data: {
          event_type: "click", path, country, locale, session_id: sid,
          x_pct: Math.round((e.clientX / window.innerWidth) * 100),
          y_pct: Math.round((e.clientY / window.innerHeight) * 100),
        },
      }).catch(() => {});
    };
    const onUnload = () => {
      if (maxDepth > 0 && !reached.has(maxDepth)) emitScroll(maxDepth);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [country, locale]);

  return null;
}
