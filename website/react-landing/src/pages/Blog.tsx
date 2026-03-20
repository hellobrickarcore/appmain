import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, User, ArrowLeft } from 'lucide-react';

const BlogCard = ({ category, title, excerpt, date, author }: { category: string, title: string, excerpt: string, date: string, author: string }) => (
  <div className="group bg-brand-navy-light/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all hover:-translate-y-1">
    <div className="inline-block px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-black uppercase tracking-widest text-brand-orange mb-6">
      {category}
    </div>
    <h3 className="text-2xl font-black text-white mb-4 group-hover:text-brand-yellow transition-colors leading-tight">{title}</h3>
    <p className="text-brand-text-dim mb-8 line-clamp-2 font-medium">{excerpt}</p>
    
    <div className="flex items-center justify-between pt-6 border-t border-white/5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-text-dim uppercase tracking-wider">
          <Calendar className="w-3 h-3" />
          {date}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-text-dim uppercase tracking-wider">
          <User className="w-3 h-3" />
          {author}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-brand-navy transition-all">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export const Blog: React.FC = () => {
  const posts = [
    {
      category: "Sorting & Scanning",
      title: "How to organize loose bricks without sorting for hours",
      excerpt: "Efficiency is key when dealing with massive piles. Learn the top-down scanning techniques used by master builders.",
      date: "Mar 19, 2026",
      author: "Brick Pilot"
    },
    {
      category: "Build Ideas",
      title: "What to build with random bricks you already own",
      excerpt: "Your loose bin is a goldmine. Discover how the HelloBrick vault helps you match pieces to thousands of unique build ideas.",
      date: "Mar 17, 2026",
      author: "Master Builder"
    },
    {
      category: "Collection Tips",
      title: "How to track your brick collection digitally",
      excerpt: "Moving from physical bins to a digital vault changes everything. Here's why every builder needs a digital inventory.",
      date: "Mar 15, 2026",
      author: "HelloBrick Team"
    },
    {
      category: "Community",
      title: "How community verification can improve brick recognition",
      excerpt: "Every time you help verify a part, the entire community gets a smarter scanner. Learn how the XP loop works.",
      date: "Mar 12, 2026",
      author: "AI Lab"
    },
    {
      category: "Sorting & Scanning",
      title: "Best ways to sort bricks by size, color and use",
      excerpt: "Should you sort by color or by shape? We settle the age-old debate for collectors and builders alike.",
      date: "Mar 10, 2026",
      author: "Layout Pro"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-brand-navy/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" light={true} />
          <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-text-dim hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-24">
            <h1 className="text-5xl sm:text-7xl font-black mb-8 uppercase tracking-tighter">
              HelloBrick <span className="text-brand-orange">Journal</span>
            </h1>
            <p className="text-xl text-brand-text-dim font-medium leading-relaxed">
              Tips, builds, collection guides, and better ways to use the bricks you already own.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-4 mb-16">
            {["All", "Build Ideas", "Collection Tips", "Scanning & Sorting", "Community", "Product Updates"].map((cat) => (
              <button 
                key={cat} 
                className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${cat === 'All' ? 'bg-white text-brand-navy border-white' : 'border-white/10 text-brand-text-dim hover:border-white/20 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <BlogCard key={i} {...post} />
            ))}
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <Logo size="md" className="justify-center" />
          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
            Hellobrick is an independent companion platform. LEGO is a trademark of the LEGO Group.
          </p>
        </div>
      </footer>
    </div>
  );
};
