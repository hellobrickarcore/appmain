import React from 'react';
import { Check, Star } from 'lucide-react';

export const SectionPricing: React.FC = () => {
  const features = [
    "Infinite AI brick detection",
    "Access to 1000+ build ideas",
    "Step-by-step 3D instructions",
    "Daily quest rewards",
    "Cloud vault synchronization",
    "Priority support"
  ];

  return (
    <section id="pricing" className="bg-slate-50/50 py-24 md:py-40 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 mb-6 mx-auto">
             <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
             <span className="text-[14px] uppercase tracking-widest font-black text-slate-500">Simple Pricing</span>
          </div>
          <h2 className="text-[2.5rem] md:text-ui-header font-black tracking-tight leading-[1.1] text-slate-900">Choose your builder path</h2>
          <p className="text-[18px] text-slate-500 font-medium max-w-xl mx-auto">
            Choose the plan that fits your building style. Start with a 14-day free trial on any Pro plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="bg-white border border-slate-100 p-10 md:p-12 rounded-[40px] flex flex-col items-start gap-8 hover:shadow-xl transition-all h-full">
            <div className="space-y-2">
              <h3 className="text-[24px] font-black text-slate-900">Free</h3>
              <p className="text-[15px] text-slate-400 font-black uppercase tracking-widest">Base Access</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-black text-slate-900">$0</span>
              <span className="text-slate-400 text-[16px] font-bold">/ forever</span>
            </div>

            <ul className="space-y-4 w-full pt-4 border-t border-slate-50">
              {[
                "1 basic scan per day",
                "5 daily build ideas",
                "Community feed access",
                "Basic build guides"
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-[16px] text-slate-500 font-medium">
                  <Check className="w-5 h-5 text-slate-200" /> {f}
                </li>
              ))}
            </ul>

            <button className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-bold text-[16px] cursor-default mt-auto">
              Current plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-10 md:p-12 rounded-[40px] flex flex-col items-start gap-8 relative overflow-hidden shadow-2xl border-4 border-brand-orange/10 h-full">
            <div className="absolute top-8 right-8 w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
              <Star className="w-6 h-6 fill-current" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-[24px] font-black text-slate-900">Pro</h3>
              <p className="text-[15px] text-brand-orange font-black uppercase tracking-widest">Unlimited Power</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[48px] font-black text-slate-900">$29.99</span>
                <span className="text-slate-400 text-[16px] font-bold">/ year</span>
              </div>
              <p className="text-[14px] font-bold text-brand-orange">14 days free trial</p>
            </div>

            <ul className="space-y-4 w-full pt-4 border-t border-slate-50">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-[16px] text-slate-600 font-bold">
                  <Check className="w-5 h-5 text-brand-orange" /> {f}
                </li>
              ))}
            </ul>

            <a 
              href="https://apps.apple.com/us/app/hellobrick/id6760016096" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-slate-900 text-white text-center py-5 rounded-2xl font-bold text-[16px] hover:bg-brand-orange transition-all shadow-xl mt-auto"
              onClick={() => (window as any).trackConversion?.('Subscribe')}
            >
              Start free trial
            </a>
          </div>
        </div>
        
        <div className="text-center mt-20">
          <p className="text-[16px] text-slate-400 font-bold">
            Or choose <span className="text-slate-900">$3.99 / month</span> billed monthly.
          </p>
        </div>

        {/* AEO-Optimized FAQ Section */}
        <div className="mt-40 max-w-4xl mx-auto">
          <h2 className="text-[2.5rem] md:text-[3rem] font-black tracking-tight leading-[1.1] mb-16 text-center text-slate-900">Frequently asked questions</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {[
              {
                q: "How does the AI scan work?",
                a: "HelloBrick uses custom-trained computer vision models (YOLOv8 & Gemini) to identify individual LEGO parts in a heap. Our precision engine matches each part's geometry against a 70,000+ SKU database in real-time."
              },
              {
                q: "Can I scan bricks in low light?",
                a: "For best results, use bright, even lighting. However, our advanced noise-reduction algorithms handle typical indoor lighting environments effectively."
              },
              {
                q: "Does it recognize off-brand or 'fake' bricks?",
                a: "HelloBrick is optimized for official LEGO geometry. While it may identify compatible parts from other brands, accuracy is highest with genuine bricks."
              },
              {
                q: "What build ideas will I see?",
                a: "The app scans your parts and cross-references them with over 1000+ MOCs (My Own Creations) and official set instructions that you can build right now."
              },
              {
                q: "Is there a refund policy?",
                a: "Yes. All Pro subscriptions come with a 14-day free trial. You can cancel through the App Store at any time with zero commitment."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:border-brand-orange/30 transition-all group shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-brand-orange transition-colors">{faq.q}</h3>
                <p className="text-[16px] text-slate-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the AI scan work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HelloBrick uses custom-trained computer vision models to identify individual LEGO parts in a heap in real-time."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a free trial?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all HelloBrick Pro plans include a 14-day free trial with full access to all features."
                }
              }
            ]
          })}
        </script>
      </div>
    </section>
  );
};
