import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

const ComplianceLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  React.useEffect(() => {
    document.title = `${title} - HelloBrick`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", `Official ${title.toLowerCase()} for the HelloBrick AI platform.`);
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange">
      <nav className="w-full border-b border-white/5 py-4 px-6 bg-brand-navy/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/">
            <Logo size="sm" light={true} />
          </Link>
          <Link to="/" className="text-ui-body font-bold text-brand-orange hover:opacity-80 transition-opacity">
            Back to site
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl sm:text-[4rem] font-black tracking-tighter mb-16">{title}</h1>
        <div className="space-y-12 text-ui-body font-medium leading-relaxed text-brand-text-dim">
          {children}
        </div>
      </main>
      <footer className="border-t border-white/5 py-12 px-6 bg-brand-navy-light/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/20 text-ui-body font-bold">© 2026 HelloBrick. Not affiliated with LEGO.</p>
        </div>
      </footer>
    </div>
  );
};

export const Privacy: React.FC = () => (
  <ComplianceLayout title="Privacy policy">
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-yellow">1. Data collection</h2>
      <p>HelloBrick processes 90% of AI metadata locally on your device. We collect minimal telemetry to improve scan accuracy and provide synchronization across devices.</p>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-yellow">2. End-to-end encryption</h2>
      <p>Your collection data is encrypted end-to-end. We do not sell your personal data or provide your build history to third parties.</p>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-yellow">3. Local processing</h2>
      <p>Image processing for brick recognition occurs on-device whenever possible to ensure maximum privacy and speed.</p>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-yellow">4. Your rights</h2>
      <p>You can request to export or delete your account data at any time via the support portal or app settings.</p>
    </section>
  </ComplianceLayout>
);

export const Terms: React.FC = () => (
  <ComplianceLayout title="Terms of service">
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-orange">1. Acceptance of terms</h2>
      <p>By using HelloBrick, you agree to these terms. HelloBrick is a tool for brick enthusiasts and collectors.</p>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-orange">2. Intellectual property</h2>
      <p>The HelloBrick AI and its visual design are properties of HelloBrick. LEGO is a trademark of the LEGO Group which does not sponsor or endorse this app.</p>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-orange">3. Fair use</h2>
      <p>Users must not use the platform for scraping data or reverse engineering the recognition engine. We provide our services for personal use only.</p>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-orange">4. Subscriptions</h2>
      <p>Premium features are available via App Store subscriptions. Billing and cancellations are managed through your Apple ID account.</p>
    </section>
  </ComplianceLayout>
);

export const Support: React.FC = () => (
  <ComplianceLayout title="Support and help">
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-yellow">Need help?</h2>
      <p>Our team is dedicated to help you get the most out of your collection. If you're experiencing issues with scanning or synchronization, contact us below.</p>
      <div className="mt-10 bg-brand-navy-light/50 p-10 rounded-[40px] border border-white/5">
        <h3 className="text-xl font-black mb-4 tracking-tight">Technical support</h3>
        <p className="text-white font-bold mb-4">Email: support@hellobrick.app</p>
        <p className="text-brand-text-dim text-ui-body font-bold opacity-40">Average response time: &lt; 24 hours</p>
      </div>
    </section>
    <section>
      <h2 className="text-[24px] font-black mb-6 text-brand-yellow">Common topics</h2>
      <ul className="list-disc pl-5 space-y-4 text-brand-text-dim text-ui-body font-medium">
        <li>Lighting tips for better scan accuracy</li>
        <li>Managing multi-device sync</li>
        <li>Understanding battle league scoring</li>
        <li>Submitting new part requests</li>
      </ul>
    </section>
  </ComplianceLayout>
);
