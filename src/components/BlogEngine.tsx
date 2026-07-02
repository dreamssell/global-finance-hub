import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/LanguageProvider";
import type { LocalizedPost } from "@/lib/posts.functions";
import { AdPlacementWrapper } from "./AdPlacementWrapper";

export function BlogEngine({ posts }: { posts: LocalizedPost[] }) {
  const { t } = useI18n();
  if (posts.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 text-center text-muted-foreground">
        {t.blog.empty}
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">{t.blog.title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <div key={p.id} className="contents">
            <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/40">
              {p.cover_image && (
                <img loading="lazy" src={p.cover_image} alt="" className="aspect-video w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-lg font-semibold leading-tight">{p.title}</h3>
                {p.excerpt && <p className="text-sm text-muted-foreground">{p.excerpt}</p>}
                <div className="mt-auto">
                  <Link to="/blog/$slug" params={{ slug: p.slug }}
                    className="text-sm font-medium text-primary hover:underline">
                    {t.blog.readMore} →
                  </Link>
                </div>
              </div>
            </article>
            {i === 2 && <div className="md:col-span-2 lg:col-span-3"><AdPlacementWrapper slot="blog-inline" height={140} /></div>}
          </div>
        ))}
      </div>
    </section>
  );
}
