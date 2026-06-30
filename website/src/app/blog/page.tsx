import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BlogPost } from "@/types";
import { Layers, ArrowRight } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function BlogIndex() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-black flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            HelloBrick
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-black transition-colors text-gray-600">
              Home
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-black transition-colors text-gray-600">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black mb-6">
            The Builder&apos;s Journal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, strategies, and stories for serious LEGO collectors and builders.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.length > 0 ? (
            posts.map((post: BlogPost) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                {post.image_url && (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-black mb-3 leading-tight group-hover:text-[#C9A84C] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center text-sm font-semibold text-black group-hover:text-[#C9A84C] transition-colors">
                    Read article <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No posts published yet. Check back soon!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
