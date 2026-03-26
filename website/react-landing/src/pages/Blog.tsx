import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';

export const Blog: React.FC = () => {
  const posts = [
    {
      category: "Sorting & scanning",
      title: "How to organize loose bricks without sorting for hours",
      excerpt: "Efficiency is key when dealing with massive piles. Learn the top-down scanning techniques used by master builders.",
      date: "Mar 19, 2026",
      author: "Brick Pilot",
      image: "/screens/onboarding_scan_bg_1773682593724.png"
    },
    {
      category: "Build ideas",
      title: "What to build with random bricks you already own",
      excerpt: "Your loose bin is a goldmine. Discover how the HelloBrick vault helps you match pieces to thousands of unique build ideas.",
      date: "Mar 17, 2026",
      author: "Master Builder",
      image: "/screens/onboarding_ideas_bg_1773682621185.png"
    },
    {
      category: "Collection tips",
      title: "How to track your brick collection digitally",
      excerpt: "Moving from physical bins to a digital vault changes everything. Here's why every builder needs a digital inventory.",
      date: "Mar 15, 2026",
      author: "HelloBrick Team",
      image: "/screens/onboarding_vault_bg_1773682607010.png"
    },
    {
      category: "Community",
      title: "How community verification can improve brick recognition",
      excerpt: "Every time you help verify a part, the entire community gets a smarter scanner. Learn how the XP loop works.",
      date: "Mar 12, 2026",
      author: "AI Lab",
      image: "/screens/welcome.png"
    },
    {
      category: "Sorting & scanning",
      title: "Best ways to sort bricks by size, color and use",
      excerpt: "Should you sort by color or by shape? We settle the age-old debate for collectors and builders alike.",
      date: "Mar 10, 2026",
      author: "Layout Pro",
      image: "/screens/train.png"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-brand-navy/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Logo size="md" light={true} />
          <Link to="/" className="flex items-center gap-2 text-ui-s font-bold text-brand-text-dim hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </nav>

      <header className="pt-40 pb-24 bg-brand-navy">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
            <span className="text-ui-s font-bold text-brand-text-dim">Journal & news</span>
          </div>
          <h1 className="text-[4rem] md:text-ui-l font-serif italic text-white leading-none tracking-tighter mb-8">The brick life.</h1>
          <p className="text-ui-m text-brand-text-dim font-medium max-w-md">Expert tips on sorting, building, and maintaining your personal collection.</p>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {posts.map((post, i) => (
            <article key={i} className="group cursor-pointer">
              <div className="aspect-[4/3] bg-brand-navy-light rounded-[40px] border border-white/5 overflow-hidden mb-8 relative">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/10 backdrop-blur-md text-white text-[12px] font-bold px-4 py-2 rounded-full border border-white/10">{post.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-ui-s font-medium text-brand-text-dim italic">{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="text-ui-s font-medium text-brand-text-dim">{post.author}</span>
              </div>
              <h3 className="text-[24px] font-bold text-white mb-4 group-hover:text-brand-yellow transition-colors leading-snug">{post.title}</h3>
              <p className="text-brand-text-dim text-ui-m leading-relaxed line-clamp-2 mb-6 font-medium">{post.excerpt}</p>
              <div className="text-brand-orange text-ui-s font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Read article <ArrowRight className="w-4 h-4" />
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="py-24 border-t border-white/5 bg-brand-navy-light/20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <Logo size="md" />
            <p className="text-ui-s text-white/20 font-medium max-w-xl text-center md:text-right italic">
              HelloBrick is an independent application. LEGO is a trademark of the LEGO Group.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
