import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hellobrick.com";
  
  // Base static routes
  const routes = [
    "",
    "/collection",
    "/wishlist",
    "/scan",
    "/dashboard",
    "/blog",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch dynamic blog posts
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    if (url && key) {
      const client = createClient(url, key);
      const { data } = await client
        .from("posts")
        .select("slug, updated_at, created_at")
        .eq("status", "published");
        
      if (data) {
        const postRoutes = data.map((post: any) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.updated_at || post.created_at || new Date().toISOString(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
        return [...routes, ...postRoutes];
      }
    }
  } catch (error) {
    console.error("Error fetching sitemap dynamic routes", error);
  }

  return routes;
}
