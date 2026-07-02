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
        className="pointer-events-none fixed inset-0 -z-10 bg-ambient bg-ambient-animated"
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
