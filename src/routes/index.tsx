import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/PublicHeader";
import { HeroSection } from "@/components/HeroSection";
import { MultiStepSimulator } from "@/components/MultiStepSimulator";
import { BlogEngine } from "@/components/BlogEngine";
import { AdPlacementWrapper } from "@/components/AdPlacementWrapper";
import { HeatmapTracker } from "@/components/HeatmapTracker";
import { listPublishedPosts } from "@/lib/posts.functions";
import { detectVisitorLocale } from "@/lib/geo.functions";
import { useI18n } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/")({
  loader: async () => {
    const geo = await detectVisitorLocale().catch(() => ({ locale: "en" as const, country: null }));
    const posts = await listPublishedPosts({ data: { locale: geo.locale } }).catch(() => []);
    return { posts, country: geo.country };
  },
  component: Index,
});

function Index() {
  const { posts, country } = Route.useLoaderData();
  const { t } = useI18n();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 700px at 10% -10%, oklch(0.72 0.14 220 / 0.35), transparent 60%), radial-gradient(900px 600px at 100% 10%, oklch(0.75 0.15 150 / 0.28), transparent 60%), radial-gradient(800px 800px at 50% 110%, oklch(0.70 0.16 300 / 0.22), transparent 60%), linear-gradient(180deg, oklch(0.99 0.01 240) 0%, oklch(0.96 0.02 240) 50%, oklch(0.94 0.03 250) 100%)",
        }}
      />
      <PublicHeader />
      <main>
        <HeroSection />
        <AdPlacementWrapper slot="home-top" height={120} />
        <MultiStepSimulator country={country} />
        <AdPlacementWrapper slot="home-mid" height={250} />
        <BlogEngine posts={posts} />
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Seguros &amp; Consórcios · {t.footer.rights}
      </footer>
      <HeatmapTracker country={country} />
    </div>
  );
}
