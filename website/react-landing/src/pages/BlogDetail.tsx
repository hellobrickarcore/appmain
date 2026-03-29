import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { Logo } from '../components/Logo';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
        
        // Update Meta Tags
        document.title = `${data.title} | HelloBrick Journal`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.excerpt);
        
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-white px-6">
        <h2 className="text-4xl font-black mb-6">Post not found</h2>
        <Link to="/blog" className="text-brand-yellow font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to journal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange">
      {/* JSON-LD for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.image_url,
          "author": { "@type": "Person", "name": post.author },
          "datePublished": post.published_at,
          "description": post.excerpt
        })}
      </script>

      <nav className="fixed top-0 z-50 w-full bg-brand-navy/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Logo size="md" light={true} />
          <Link to="/blog" className="flex items-center gap-2 text-ui-body font-bold text-brand-text-dim hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to journal
          </Link>
        </div>
      </nav>

      <article className="pt-40 max-w-[800px] mx-auto px-6 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-brand-yellow/10 text-brand-yellow text-[12px] font-black px-4 py-1.5 rounded-full border border-brand-yellow/20 uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-brand-text-dim text-[14px] font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {new Date(post.published_at).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-[3.5rem] md:text-[5rem] font-black text-white leading-[0.9] tracking-tighter mb-12">
            {post.title}
          </h1>

          <div className="flex items-center justify-between py-8 border-y border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                 <User className="w-6 h-6 text-brand-text-dim" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold leading-none mb-1">{post.author}</span>
                <span className="text-[12px] font-medium text-brand-text-dim uppercase tracking-wider">Engineering Content</span>
              </div>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {post.image_url && (
          <div className="w-full aspect-video rounded-[40px] overflow-hidden border border-white/10 mb-16 shadow-2xl">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-invert prose-brand max-w-none">
          <ReactMarkdown 
            components={{
              h2: ({children}) => <h2 className="text-[32px] font-black mt-16 mb-8 text-white tracking-tight">{children}</h2>,
              h3: ({children}) => <h3 className="text-[24px] font-bold mt-12 mb-6 text-white">{children}</h3>,
              p: ({children}) => <p className="text-[18px] leading-[1.7] text-brand-text-dim font-medium mb-8">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-inside space-y-4 mb-8 text-brand-text-dim font-medium">{children}</ul>,
              li: ({children}) => <li className="text-[18px]">{children}</li>,
              strong: ({children}) => <strong className="text-white font-black">{children}</strong>,
              blockquote: ({children}) => (
                <blockquote className="border-l-4 border-brand-yellow pl-8 py-4 my-12 bg-white/5 rounded-r-2xl italic text-[20px] font-medium text-white/80">{children}</blockquote>
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      <footer className="py-24 border-t border-white/5 bg-brand-navy-light/20">
        <div className="max-w-[1440px] mx-auto px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <Logo size="md" />
            <p className="text-ui-body text-white/20 font-bold max-w-xl text-center md:text-right">
              HelloBrick is an independent application. LEGO is a trademark of the LEGO Group.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
