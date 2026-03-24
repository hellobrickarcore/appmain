import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, User, ArrowLeft, Search, Filter } from 'lucide-react';

const BlogCard = ({ category, title, excerpt, date, slug }: { category: string, title: string, excerpt: string, date: string, slug: string }) => (
  <div className="group bg-brand-navy-light/30 border border-white/5 rounded-[40px] p-10 hover:border-brand-orange/20 transition-all hover:-translate-y-2 flex flex-col h-full">
    <div className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-8 self-start">
      {category}
    </div>
    <h3 className="text-3xl font-black text-white mb-6 group-hover:text-brand-yellow transition-colors leading-[1.1] tracking-tighter uppercase">{title}</h3>
    <p className="text-brand-text-dim mb-10 line-clamp-3 font-bold text-sm uppercase tracking-wide opacity-80 leading-relaxed">{excerpt}</p>
    
    <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
      <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
        <Calendar className="w-4 h-4" />
        {date}
      </div>
      <Link to={`/articles/${slug}`} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-brand-orange group-hover:text-brand-navy transition-all shadow-xl">
        <ChevronRight className="w-6 h-6" />
      </Link>
    </div>
  </div>
);

export const Blog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const posts = [
    {
      category: "Sorting & Organizing",
      title: "How to organize LEGO bricks like a master collector",
      excerpt: "Stop sorting for hours. Learn the top-down scanning and binning techniques that turn a messy pile into a usable vault.",
      date: "Mar 24, 2026",
      slug: "how-to-organize-lego-bricks"
    },
    {
      category: "Build Ideas",
      title: "What to build with random LEGO pieces today",
      excerpt: "Your loose bin is a goldmine. Discover how your HelloBrick collection can suggest thousands of unique Mini-MOC ideas.",
      date: "Mar 23, 2026",
      slug: "what-to-build-with-random-lego-pieces"
    },
    {
      category: "Cataloging",
      title: "How to identify any LEGO piece from a mixed pile",
      excerpt: "Learn the secrets of part numbers, stud counts, and visual identification with the HelloBrick scanner.",
      date: "Mar 22, 2026",
      slug: "how-to-identify-lego-pieces-from-a-mixed-pile"
    },
    {
      category: "Storage Guide",
      title: "The best ways to store LEGO for kids and collectors",
      excerpt: "From color-coding to shape sorting, we break down the storage systems that actually stick.",
      date: "Mar 21, 2026",
      slug: "best-ways-to-store-lego-for-kids"
    },
    {
      category: "Product Comparison",
      title: "HelloBrick vs Brickit: Which LEGO app is better for you?",
      excerpt: "A deep dive into part detection, collection tracking, and build ideas for the modern builder.",
      date: "Mar 20, 2026",
      slug: "hellobrick-vs-brickit"
    },
    {
      category: "Community Lab",
      title: "How community verification powers the HelloBrick scanner",
      excerpt: "Every time you verify a part, you earn XP and make the scanner smarter for everyone. Learn the loop.",
      date: "Mar 19, 2026",
      slug: "how-community-verification-improves-brick-recognition"
    }
  ];

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      {/* Premium Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-brand-navy/90 backdrop-blur-2xl border-b border-white/5 h-24 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Logo size="md" light={true} />
          <Link to="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-dim hover:text-white transition-all group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-48 pb-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-32 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-orange/10 rounded-full border border-brand-orange/20">
               <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">Official Publication</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black mb-10 uppercase tracking-tighter leading-[0.85]">
              The HelloBrick <br />
              <span className="text-brand-orange">Journal.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-brand-text-dim font-medium leading-relaxed italic">
              Guides, case studies, and better ways to use the bricks you already have.
            </p>
          </div>

          {/* Categories Filter Strip */}
          <div className="flex flex-wrap items-center gap-4 mb-20 border-b border-white/5 pb-12">
            {["All", "Sorting & Organizing", "Build Ideas", "Cataloging", "Storage Guide", "Community Lab"].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeCategory === cat ? 'bg-white text-brand-navy border-white shadow-xl scale-105' : 'border-white/10 text-brand-text-dim hover:border-white/20 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post, i) => (
              <BlogCard key={i} {...post} />
            ))}
          </div>

          {/* Business Inquiry CTA in Blog */}
          <div className="mt-40 p-12 sm:p-20 rounded-[60px] bg-brand-navy-light/40 border border-white/5 text-center space-y-8">
             <h2 className="text-4xl font-black uppercase tracking-tighter">Writing for builders?</h2>
             <p className="text-brand-text-dim max-w-xl mx-auto font-medium">We collaborate with educators and collectors. Get in touch if you have a story to tell about LEGO and the community.</p>
             <button className="h-14 px-10 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Contact the Team
             </button>
          </div>
        </div>
      </main>

      <footer className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <Logo size="md" className="justify-center" />
          <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.5em] leading-relaxed max-w-2xl mx-auto">
             HelloBrick is an independent companion platform. LEGO is a trademark of the LEGO Group.
          </p>
        </div>
      </footer>
    </div>
  );
};
