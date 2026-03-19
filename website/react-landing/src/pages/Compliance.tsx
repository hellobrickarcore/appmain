import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

const ComplianceLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-white text-slate-900 font-sans">
    <nav className="w-full border-b border-slate-100 py-4 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <Link to="/" className="text-sm font-semibold text-brand-orange hover:opacity-80 transition-opacity">
          Back to Site
        </Link>
      </div>
    </nav>
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black tracking-tight mb-12 uppercase">{title}</h1>
      <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-p:text-slate-600 prose-p:leading-relaxed">
        {children}
      </div>
    </main>
    <footer className="border-t border-slate-100 py-12 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-slate-400 text-xs">© 2026 HelloBrick AI. Not affiliated with LEGO.</p>
      </div>
    </footer>
  </div>
);

export const Privacy: React.FC = () => (
  <ComplianceLayout title="Privacy Policy">
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">1. Data Collection</h2>
      <p>HelloBrick processes 90% of AI metadata locally on your device. We collect minimal telemetry to improve scan accuracy and provide synchronization across devices.</p>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">2. End-to-End Encryption</h2>
      <p>Your collection data is encrypted end-to-end. We do not sell your personal data or provide your build history to third parties.</p>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">3. Local Processing</h2>
      <p>Image processing for brick recognition occurs on-device whenever possible to ensure maximum privacy and speed.</p>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">4. Your Rights</h2>
      <p>You can request to export or delete your account data at any time via the Support portal or App Settings.</p>
    </section>
  </ComplianceLayout>
);

export const Terms: React.FC = () => (
  <ComplianceLayout title="Terms of Service">
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
      <p>By using HelloBrick, you agree to these terms. HelloBrick is a tool for brick enthusiasts and collectors.</p>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">2. Intellectual Property</h2>
      <p>The HelloBrick AI and its visual design are properties of HelloBrick. LEGO is a trademark of the LEGO Group which does not sponsor or endorse this app.</p>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">3. Fair Use</h2>
      <p>Users must not use the platform for scraping data or reverse engineering the recognition engine. We provide our services for personal use only.</p>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">4. Subscriptions</h2>
      <p>Premium features are available via App Store subscriptions. Billing and cancellations are managed through your Apple ID account.</p>
    </section>
  </ComplianceLayout>
);

export const Support: React.FC = () => (
  <ComplianceLayout title="Support & Help">
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Need Help?</h2>
      <p>Our team is dedicated to help you get the most out of your collection. If you're experiencing issues with scanning or synchronization, contact us below.</p>
      <div className="mt-8 bg-slate-50 p-8 rounded-3xl border border-slate-100">
        <h3 className="font-bold mb-2">Technical Support</h3>
        <p className="text-slate-600 mb-4">Email: support@hellobrick.app</p>
        <p className="text-slate-600">Average response time: &lt; 24 hours</p>
      </div>
    </section>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Common Topics</h2>
      <ul className="list-disc pl-5 space-y-2 text-slate-600">
        <li>Lighting tips for better scan accuracy</li>
        <li>Managing multi-device sync</li>
        <li>Understanding Battle League scoring</li>
        <li>Submitting new part requests</li>
      </ul>
    </section>
  </ComplianceLayout>
);
