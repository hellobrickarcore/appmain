import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VisualProof from './components/VisualProof';
import BentoValueProps from './components/BentoValueProps';
import AsymmetricBento from './components/AsymmetricBento';
import Subscribe from './components/Subscribe';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      <Navbar />
      <Hero />
      <VisualProof />
      
      {/* Sections with matching IDs for Navbar links */}
      <div id="features">
        <BentoValueProps />
      </div>
      
      <div id="how-it-works">
        <AsymmetricBento />
      </div>
      
      <Subscribe />
      <Footer />
    </div>
  );
}
