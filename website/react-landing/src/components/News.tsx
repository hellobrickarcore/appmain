import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function News() {
  const articles = [
    {
      id: 1,
      date: 'April 10, 2026',
      title: 'The First End-to-End AI Brick Scanner',
      bgBase: 'bg-[#0A0B1A]',
      brand: true,
      imageContent: (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white font-display text-4xl font-bold flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl text-[#0A0B1A] flex items-center justify-center">H</div>
            HelloBrick <span className="opacity-50 font-normal mx-2">|</span> <span className="text-[#A3FA11]">AI</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      date: 'March 4, 2026',
      title: 'AI Broke Building. We\'re Fixing It—Starting With Your Ideas',
      bgBase: 'bg-black',
      brand: false,
      imageContent: (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
           <h3 className="text-white font-display text-4xl font-bold leading-tight text-center max-w-[280px] z-10">
             Verified<br/>Builds<br/>Gallery
           </h3>
           <div className="mt-auto w-48 h-24 bg-[#FF2E93] rounded-t-full relative flex items-center justify-center">
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-4">PRO feature</div>
              <div className="w-16 h-2 bg-black/20 rounded-full mt-4"></div>
           </div>
        </div>
      )
    },
    {
      id: 3,
      date: 'February 14, 2026',
      title: 'Digital Instructions: Global Launch',
      bgBase: 'bg-[#00D1FF]',
      brand: false,
      imageContent: (
        <div className="absolute inset-0 flex items-center justify-center p-8">
           <h3 className="text-black font-display text-5xl font-bold leading-tight">
             Digital<br/>Instructions<br/>Global.
           </h3>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          The latest ideas from HelloBrick
        </h2>
        <div className="hidden md:flex gap-3">
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
             <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
             <ArrowRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
        {articles.map((article) => (
          <div key={article.id} className="min-w-[300px] md:min-w-[420px] max-w-[480px] flex-shrink-0 snap-start flex flex-col cursor-pointer group">
            <div className={`relative h-[260px] rounded-t-[32px] overflow-hidden ${article.bgBase}`}>
               {/* Pattern overlay */}
               {article.brand && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 4px, transparent 0)', backgroundSize: '60px 60px' }}></div>}
               {article.imageContent}
            </div>
            
            <div className="border border-t-0 border-gray-100 rounded-b-[32px] p-8 flex flex-col flex-1 bg-white group-hover:shadow-xl transition-shadow duration-300">
              <div className="text-gray-500 text-sm mb-4">{article.date}</div>
              <h3 className="font-display text-xl font-semibold leading-snug text-gray-900 group-hover:text-brand transition-colors">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
