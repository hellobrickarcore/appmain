import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { BlogPost } from "@/types";
import { Layers, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const supabase = getSupabaseClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.seo_metadata?.description || post.excerpt,
    keywords: post.seo_metadata?.keywords || [],
    openGraph: {
      title: post.title,
      description: post.seo_metadata?.description || post.excerpt,
      images: post.image_url ? [post.image_url] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seo_metadata?.description || post.excerpt,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const supabase = getSupabaseClient();
  const { data: post } = (await supabase
    .from("posts")
    .select("*")
    .eq("slug", params.slug)
    .single()) as { data: BlogPost | null };

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-black flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            HelloBrick
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium hover:text-black transition-colors text-gray-600">
              Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-bold uppercase tracking-wider text-[#C9A84C]">
            {post.category}
          </span>
          <span className="text-sm text-gray-400">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6 leading-tight">
          {post.title}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-8">
          {post.excerpt}
        </p>
      </header>

      {/* Hero Image */}
      {post.image_url && (
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-2xl mx-auto px-6 pb-32">
        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#C9A84C] prose-img:rounded-2xl">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
