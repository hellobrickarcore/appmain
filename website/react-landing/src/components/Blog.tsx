import { ArrowRight, Calendar, User } from 'lucide-react';

const POSTS = [
  {
    slug: 'hellobrick-vs-brickit-the-ultimate-comparison',
    title: "HelloBrick vs. Brickit: Which LEGO Scanner App is Best?",
    excerpt: "We compare the top LEGO recognition apps of 2026. See how HelloBrick's new YOLO-powered engine stacks up against the competition.",
    date: "May 4, 2026",
    author: "HelloBrick Team",
    category: "Comparisons"
  },
  {
    slug: 'how-to-identify-lego-bricks-without-sorting',
    title: "How to Identify LEGO Bricks in Seconds (No Sorting Required)",
    excerpt: "Stop wasting hours sorting your collection. Learn how AI-powered scanning can turn your messy pile into a master build instantly.",
    date: "May 3, 2026",
    author: "Brick Expert",
    category: "Tutorials"
  },
  {
    slug: 'top-10-lego-moc-ideas-for-random-collections',
    title: "Top 10 LEGO MOC Ideas for Your Random Brick Collection",
    excerpt: "Unlock the potential of your loose bricks. From micro-scale space ships to architectural landmarks, here's what you can build today.",
    date: "May 2, 2026",
    author: "Master Builder",
    category: "Inspiration"
  }
];

export default function Blog() {
  return (
    <section id="blog" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
            The Builder's Journal
          </h2>
          <p className="text-xl text-gray-600">
            Latest news, building tips, and LEGO AI technology updates.
          </p>
        </div>
        <button className="bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand-hover transition-colors">
          View All Posts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {POSTS.map((post, i) => (
          <article key={i} className="group cursor-pointer">
            <div className="aspect-[16/10] bg-gray-100 rounded-[32px] mb-6 overflow-hidden relative">
               {/* Placeholder for SEO-optimized images */}
               <div className="absolute inset-0 bg-brand-yellow/10 group-hover:bg-brand-yellow/20 transition-colors"></div>
               <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-brand">
                 {post.category}
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
            </div>

            <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-brand transition-colors">
              {post.title}
            </h3>
            
            <p className="text-gray-600 mb-6 line-clamp-2">
              {post.excerpt}
            </p>

            <a href={`/blog/${post.slug}`} className="inline-flex items-center font-bold text-brand group-hover:gap-2 transition-all">
              Read More <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
