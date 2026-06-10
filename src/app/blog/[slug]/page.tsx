import { posts } from "../posts";
import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://crm.tabishbinishfaq.dev";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${baseUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: `${baseUrl}/og-image.svg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            author: {
              "@type": "Person",
              name: post.author,
            },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            publisher: {
              "@type": "Organization",
              name: "LeadFlow",
              url: baseUrl,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${baseUrl}/blog/${post.slug}`,
            },
            image: `${baseUrl}/og-image.svg`,
          }),
        }}
      />
      <div className="min-h-screen bg-background">
        <article className="mx-auto max-w-3xl px-4 py-12">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/50 bg-background/60 px-2.5 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.sections.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-border/40 pt-8">
            <div className="rounded-xl border border-border/40 bg-background/50 p-6 text-center">
              <h3 className="font-semibold">Try LeadFlow — No Signup Needed</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Click one button and you are in a fully-loaded workspace with real demo data.
              </p>
              <div className="mt-4">
                <Link
                  href="https://crm.tabishbinishfaq.dev"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Launch Demo
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
