import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicHeader } from "@/components/PublicHeader";
import { HeatmapTracker } from "@/components/HeatmapTracker";
import { getPostBySlug } from "@/lib/posts.functions";
import { detectVisitorLocale } from "@/lib/geo.functions";
import { useI18n } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const geo = await detectVisitorLocale().catch(() => ({ locale: "en" as const, country: null }));
    const post = await getPostBySlug({ data: { slug: params.slug, locale: geo.locale } });
    if (!post) throw notFound();
    return { post, country: geo.country };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.post.title },
          { name: "description", content: loaderData.post.excerpt ?? loaderData.post.title },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt ?? loaderData.post.title },
          ...(loaderData.post.cover_image
            ? [
                { property: "og:image", content: loaderData.post.cover_image },
                { name: "twitter:image", content: loaderData.post.cover_image },
              ]
            : []),
        ]
      : [],
  }),
  component: PostPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background"><PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">Post not found.</div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background"><PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">{String(error?.message ?? error)}</div>
    </div>
  ),
});

function PostPage() {
  const { post, country } = Route.useLoaderData();
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← {t.blog.back}</Link>
        {post.cover_image && (
          <img src={post.cover_image} alt="" className="mt-6 aspect-video w-full rounded-2xl object-cover" />
        )}
        <h1 className="mt-6 text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}
        {post.body && (
          <div className="prose prose-neutral mt-8 whitespace-pre-wrap leading-relaxed text-foreground">
            {post.body}
          </div>
        )}
      </article>
      <HeatmapTracker country={country} />
    </div>
  );
}
