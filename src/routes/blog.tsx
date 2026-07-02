import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/PublicHeader";
import { BlogEngine } from "@/components/BlogEngine";
import { HeatmapTracker } from "@/components/HeatmapTracker";
import { detectVisitorLocale } from "@/lib/geo.functions";
import { listPublishedPosts } from "@/lib/posts.functions";

export const Route = createFileRoute("/blog")({
  loader: async () => {
    const geo = await detectVisitorLocale().catch(() => ({ locale: "en" as const, country: null }));
    const posts = await listPublishedPosts({ data: { locale: geo.locale } }).catch(() => []);
    return { posts, country: geo.country };
  },
  head: () => ({
    meta: [
      { title: "Blog — Insurance & Savings Clubs" },
      { name: "description", content: "Expert articles on insurance and savings clubs, localized for BR, PT, EN, ES, and IT audiences." },
      { property: "og:title", content: "Blog — Insurance & Savings Clubs" },
      { property: "og:description", content: "Expert multilingual articles comparing insurance and savings clubs." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { posts, country } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      </main>
      <BlogEngine posts={posts} />
      <HeatmapTracker country={country} />
    </div>
  );
}
