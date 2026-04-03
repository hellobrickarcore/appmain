import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabaseService';

export const Blog: React.FC = () => {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    document.title = "HelloBrick Journal - Master LEGO Sorting & Building";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Expert tips on LEGO sorting, AI brick recognition, and building ideas. Master your collection with the HelloBrick engineering journal.");
    }

    const fetchPosts = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('published_at', { ascending: false });
        
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "The Brick Life",
    "description": "Expert tips on sorting, building, and maintaining your personal LEGO collection.",
    "publisher": {
      "@type": "Organization",
      "name": "HelloBrick"
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-orange selection:text-white">
      <script type="application/ld+json">
        {JSON.stringify(blogSchema)}
      </script>
      
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Logo size="md" light={false} />
          <Link to="/" className="flex items-center gap-2 text-[15px] font-bold text-slate-600 hover:text-brand-orange transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </nav>

      <header className="pt-40 pb-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
            <span className="text-[14px] uppercase tracking-widest font-black text-slate-500">Resource Hub</span>
          </div>
          <h1 className="text-[3rem] md:text-[4.5rem] font-black text-slate-900 leading-[1.05] tracking-tight mb-8">The Brick Life</h1>
          
          <div className="max-w-xl">
            <p className="text-[18px] text-slate-600 font-medium leading-relaxed">
              Master your collection with expert guides on <strong className="text-slate-900">AI recognition</strong>, LEGO engineering, and creative sorting hacks.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
            {posts.map((post, i) => (
              <Link to={`/blog/${post.slug}`} key={i} className="group cursor-pointer block">
                <article className="flex flex-col h-full">
                  <div className="aspect-[16/10] bg-slate-50 rounded-[32px] overflow-hidden mb-8 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[13px] font-bold text-slate-400 capitalize">{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-[13px] font-bold text-slate-400">{post.author || "HelloBrick AI"}</span>
                    </div>
                    <h3 className="text-[24px] font-black text-slate-900 mb-4 group-hover:text-brand-orange transition-colors leading-[1.2] tracking-tight">
                        {post.title}
                    </h3>
                    <p className="text-slate-500 text-[16px] leading-[1.6] line-clamp-3 mb-8 font-medium">
                        {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-auto h-[2px] w-0 bg-brand-orange group-hover:w-16 transition-all duration-500"></div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <Logo size="md" light={false} />
            <p className="text-[14px] text-slate-400 font-bold max-w-xl text-center md:text-right">
              HelloBrick is an independent application. LEGO is a trademark of the LEGO Group.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
