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
    <section id="pricing" className="bg-brand-navy py-40 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-[3.5rem] md:text-ui-header font-black tracking-tighter leading-none">Pricing</h2>
          <p className="text-ui-body text-brand-text-dim font-medium max-w-xl mx-auto">
            Choose the plan that fits your building style. Start with a 14-day free trial on any Pro plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-brand-navy-light border border-white/5 p-12 rounded-[48px] flex flex-col items-start gap-8 hover:border-white/10 transition-all">
            <div className="space-y-2">
              <h3 className="text-[24px] font-black text-white">Free</h3>
              <p className="text-ui-body text-brand-text-dim font-medium">Basic access</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-black text-white">$0</span>
              <span className="text-ui-body text-brand-text-dim font-medium">/ forever</span>
            </div>

            <ul className="space-y-4 w-full pt-4 border-t border-white/5">
              {[
                "1 basic scan per day",
                "5 daily build ideas",
                "Community feed",
                "Basic build guides"
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-ui-body text-brand-text-dim font-medium">
                  <Check className="w-5 h-5 text-white/20" /> {f}
                </li>
              ))}
            </ul>

            <button className="w-full bg-white/5 text-white py-5 rounded-2xl font-bold text-ui-body hover:bg-white/10 transition-all mt-auto">
              Current plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-12 rounded-[48px] flex flex-col items-start gap-8 relative overflow-hidden shadow-2xl scale-105">
            <div className="absolute top-8 right-8 w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-black">
              <Star className="w-6 h-6 fill-current" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-[24px] font-black text-brand-navy">Pro</h3>
              <p className="text-ui-body text-brand-navy/60 font-black">Unlimited power</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[48px] font-black text-brand-navy">$29.99</span>
                <span className="text-ui-body text-brand-navy/60 font-bold">/ year</span>
              </div>
              <p className="text-[14px] font-bold text-brand-orange">14 days free trial</p>
            </div>

            <ul className="space-y-4 w-full pt-4 border-t border-brand-navy/5">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-ui-body text-brand-navy/80 font-bold">
                  <Check className="w-5 h-5 text-brand-orange" /> {f}
                </li>
              ))}
            </ul>

            <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="w-full bg-brand-navy text-white text-center py-5 rounded-2xl font-bold text-ui-body hover:bg-black transition-all shadow-xl mt-auto">
              Start free trial
            </a>
          </div>
        </div>
        
        <div className="text-center mt-20">
          <p className="text-ui-body text-brand-text-dim font-bold">
            Or choose <span className="text-white">$3.99 / month</span> billed monthly.
          </p>
        </div>

        {/* AEO-Optimized FAQ Section */}
        <div className="mt-40 max-w-4xl mx-auto">
          <h2 className="text-[2.5rem] md:text-[3.5rem] font-black tracking-tighter leading-none mb-16 text-center">Frequently asked questions</h2>
          
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
              <div key={idx} className="bg-brand-navy-light/50 border border-white/5 rounded-3xl p-8 hover:border-brand-yellow/30 transition-all group">
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-brand-yellow transition-colors">{faq.q}</h3>
                <p className="text-ui-body text-brand-text-dim font-medium leading-relaxed">{faq.a}</p>
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
