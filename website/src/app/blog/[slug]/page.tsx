import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { BlogPost } from "@/types";
import { 
  Scan, ArrowLeft, ArrowRight, Calendar, User, 
  Sparkles, Share2, Tag, X, Disc 
} from "lucide-react";
import ReactMarkdown from "react-markdown";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://tlcqiixlpmpguixzbbxj.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3FpaXhscG1wZ3VpeHpiYnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0ODk3MCwiZXhwIjoyMDg4MDI0OTcwfQ.OK9uiI8sl-sRk7BlpsLkFxs-gxFzDj3RpJsivpgCvTg";
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
      title: "Post Not Found | HelloBrick",
    };
  }

  return {
    title: `${post.title} | HelloBrick Journal`,
    description: post.seo_metadata?.description || post.excerpt,
    keywords: post.seo_metadata?.keywords || ["LEGO", "HelloBrick", "AR Scanner"],
    openGraph: {
      title: `${post.title} | HelloBrick`,
      description: post.seo_metadata?.description || post.excerpt,
      images: post.image_url ? [post.image_url] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | HelloBrick`,
      description: post.seo_metadata?.description || post.excerpt,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

// ─── Navbar Component ────────────────────────────────────────────────────────
function BlogNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center p-2 shadow-md shadow-emerald-500/20">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">HelloBrick</span>
        </Link>
      </div>

      <div className="hidden lg:flex flex-1 justify-center items-center gap-8 text-[15px] font-semibold text-gray-600">
        <Link href="/#features" className="hover:text-emerald-600 transition-colors">AR Scanner</Link>
        <Link href="/#portfolio" className="hover:text-emerald-600 transition-colors">Portfolio</Link>
        <Link href="/#ideas" className="hover:text-emerald-600 transition-colors">What Can I Build</Link>
        <Link href="/#comparison" className="hover:text-emerald-600 transition-colors">Why HelloBrick</Link>
        <Link href="/#pricing" className="hover:text-emerald-600 transition-colors">Pro</Link>
        <Link href="/blog" className="text-emerald-600 font-bold">Blog</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden md:block font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
          Sign In
        </Link>
        <a
          href="https://apps.apple.com/app/id6760016096"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Get App</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </nav>
  );
}

// ─── Footer Component ────────────────────────────────────────────────────────
function BlogFooter() {
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 justify-between mb-16">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">HelloBrick</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            The next-generation AI &amp; AR scanner and collectible tracking platform for LEGO® collectors, AFOLs, and builders worldwide.
          </p>
          <div className="flex gap-3">
            <a href="https://twitter.com/hellobrick" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all text-gray-300 hover:text-white">
              <X className="w-4 h-4" />
            </a>
            <a href="https://discord.gg/hellobrick" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all text-gray-300 hover:text-white">
              <Disc className="w-4 h-4" fill="currentColor" />
            </a>
          </div>
        </div>

        <div className="flex-[2] grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><Link href="/#features" className="hover:text-white transition-colors">AR Scanner</Link></li>
              <li><Link href="/#portfolio" className="hover:text-white transition-colors">Portfolio Tracker</Link></li>
              <li><Link href="/#ideas" className="hover:text-white transition-colors">What Can I Build</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">HelloBrick Pro</Link></li>
              <li><a href="https://apps.apple.com/app/id6760016096" className="hover:text-white transition-colors">iOS App Store</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Web App Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Collector Blog</Link></li>
              <li><a href="mailto:support@hellobrick.app" className="hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><a href="https://hellobrick.app/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="https://hellobrick.app/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} HelloBrick. All rights reserved.</p>
        <p className="max-w-xl text-center md:text-right">
          DISCLAIMER: HelloBrick is an independent enthusiast application and is not affiliated, sponsored, authorized, or endorsed by the LEGO Group. LEGO® is a registered trademark of the LEGO Group.
        </p>
      </div>
    </footer>
  );
}

// ─── Article Reader Page ──────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <BlogNavbar />

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-6 pt-36 pb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
          Back to Journal
        </Link>

        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider mb-4">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
            {post.category || "LEGO Guide"}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 font-normal lowercase flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 pt-6 border-t border-gray-100 text-sm text-gray-500">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
            {post.author ? post.author.charAt(0) : "H"}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">{post.author || "HelloBrick Team"}</span>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {post.image_url && (
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Markdown Content */}
      <article className="max-w-3xl mx-auto px-6 pb-20">
        <div className="prose prose-lg prose-emerald max-w-none prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-emerald-600 prose-a:font-semibold prose-img:rounded-3xl prose-hr:border-gray-200">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* In-Article App Store CTA Card */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Track your collection in real time</h3>
            <p className="text-emerald-100 text-sm max-w-md">
              Point your camera and get instant live AR prices, sealed vs. used splits, and AI build guides on HelloBrick.
            </p>
          </div>
          <a
            href="https://apps.apple.com/app/id6760016096"
            className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all text-center"
          >
            Download Free on iOS
          </a>
        </div>
      </article>

      <BlogFooter />
    </div>
  );
}
