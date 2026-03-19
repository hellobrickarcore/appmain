import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

const ComplianceLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange">
    <nav className="w-full border-b border-white/5 py-4 px-6 bg-brand-navy/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/">
          <Logo size="sm" light={true} />
        </Link>
        <Link to="/" className="text-sm font-black uppercase tracking-widest text-brand-orange hover:opacity-80 transition-opacity">
          Back to Site
        </Link>
      </div>
    </nav>
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-16 uppercase">{title}</h1>
      <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-brand-text-dim prose-p:leading-relaxed prose-p:text-lg">
        {children}
      </div>
    </main>
    <footer className="border-t border-white/5 py-12 px-6 bg-brand-navy-light/30">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-brand-text-dim text-xs font-bold uppercase tracking-[0.3em]">© 2026 HelloBrick AI. Not affiliated with LEGO.</p>
      </div>
    </footer>
  </div>
);

export const Privacy: React.FC = () => (
  <ComplianceLayout title="Privacy Policy">
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-yellow">1. Data Collection</h2>
      <p>HelloBrick processes 90% of AI metadata locally on your device. We collect minimal telemetry to improve scan accuracy and provide synchronization across devices.</p>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-yellow">2. End-to-End Encryption</h2>
      <p>Your collection data is encrypted end-to-end. We do not sell your personal data or provide your build history to third parties.</p>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-yellow">3. Local Processing</h2>
      <p>Image processing for brick recognition occurs on-device whenever possible to ensure maximum privacy and speed.</p>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-yellow">4. Your Rights</h2>
      <p>You can request to export or delete your account data at any time via the Support portal or App Settings.</p>
    </section>
  </ComplianceLayout>
);

export const Terms: React.FC = () => (
  <ComplianceLayout title="Terms of Service">
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-orange">1. Acceptance of Terms</h2>
      <p>By using HelloBrick, you agree to these terms. HelloBrick is a tool for brick enthusiasts and collectors.</p>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-orange">2. Intellectual Property</h2>
      <p>The HelloBrick AI and its visual design are properties of HelloBrick. LEGO is a trademark of the LEGO Group which does not sponsor or endorse this app.</p>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-orange">3. Fair Use</h2>
      <p>Users must not use the platform for scraping data or reverse engineering the recognition engine. We provide our services for personal use only.</p>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-orange">4. Subscriptions</h2>
      <p>Premium features are available via App Store subscriptions. Billing and cancellations are managed through your Apple ID account.</p>
    </section>
  </ComplianceLayout>
);

export const Support: React.FC = () => (
  <ComplianceLayout title="Support & Help">
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-yellow">Need Help?</h2>
      <p>Our team is dedicated to help you get the most out of your collection. If you're experiencing issues with scanning or synchronization, contact us below.</p>
      <div className="mt-10 bg-brand-navy-light/50 p-10 rounded-[2.5rem] border border-white/5 glow-orange">
        <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Technical Support</h3>
        <p className="text-white font-bold mb-4">Email: support@hellobrick.app</p>
        <p className="text-brand-text-dim text-sm font-medium">Average response time: &lt; 24 hours</p>
      </div>
    </section>
    <section className="mb-12">
      <h2 className="text-2xl font-black mb-6 italic text-brand-yellow">Common Topics</h2>
      <ul className="list-disc pl-5 space-y-4 text-brand-text-dim text-lg">
        <li>Lighting tips for better scan accuracy</li>
        <li>Managing multi-device sync</li>
        <li>Understanding Battle League scoring</li>
        <li>Submitting new part requests</li>
      </ul>
    </section>
  </ComplianceLayout>
);
