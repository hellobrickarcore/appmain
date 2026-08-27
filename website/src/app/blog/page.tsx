import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { BlogPost } from "@/types";
import { 
  Scan, ArrowRight, Calendar, User, ArrowLeft, 
  Sparkles, TrendingUp, Search, Tag, Clock, X, Disc 
} from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

async function getPosts(): Promise<BlogPost[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://tlcqiixlpmpguixzbbxj.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3FpaXhscG1wZ3VpeHpiYnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0ODk3MCwiZXhwIjoyMDg4MDI0OTcwfQ.OK9uiI8sl-sRk7BlpsLkFxs-gxFzDj3RpJsivpgCvTg";
    if (!url || !key) return [];
    const client = createClient(url, key);
    const { data } = await client
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    return (data as BlogPost[]) || [];
  } catch {
    return [];
  }
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

// ─── Main Blog Index ──────────────────────────────────────────────────────────
export default async function BlogIndex() {
  const posts = await getPosts();
  const featuredPost = posts && posts.length > 0 ? posts[0] : null;
  const standardPosts = posts && posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans antialiased">
      <BlogNavbar />

      {/* Hero Header */}
      <section className="pt-36 pb-14 px-6 bg-gradient-to-b from-emerald-50/40 via-white to-[#F8FAFC]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-emerald-800 text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>The Builder &amp; Collector Journal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Insights, Strategies &amp; <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              LEGO® Market Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From real-time AR scanning technology to secondary market investment forecasts and AI build guides.
          </p>
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-6xl mx-auto px-6 pb-28">
        {/* Featured Post Card */}
        {featuredPost && (
          <div className="mb-16">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 items-center"
            >
              <div className="lg:col-span-7 aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 relative">
                {featuredPost.image_url ? (
                  <img
                    src={featuredPost.image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-6xl">
                    🧱
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Featured
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
                <div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    <span className="text-emerald-600 font-bold">{featuredPost.category || "Insight"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-normal lowercase">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featuredPost.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight mb-4">
                    {featuredPost.title}
                  </h2>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{featuredPost.author || "HelloBrick Team"}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Standard Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {standardPosts && standardPosts.length > 0 ? (
            standardPosts.map((post: BlogPost) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-200/80 hover:shadow-xl hover:border-gray-300 transition-all duration-300"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-4xl">
                      🧱
                    </div>
                  )}
                  <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                    {post.category || "LEGO Guide"}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-snug mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">{post.author || "HelloBrick AI"}</span>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            !featuredPost && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-200">
                <p className="text-gray-500 font-medium">No published posts found. Check back soon!</p>
              </div>
            )
          )}
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
