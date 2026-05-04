import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VisualProof from './components/VisualProof';
import BentoValueProps from './components/BentoValueProps';
import AsymmetricBento from './components/AsymmetricBento';
import Subscribe from './components/Subscribe';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <VisualProof />
      <BentoValueProps />
      <AsymmetricBento />
      <Subscribe />
      <Footer />
    </div>
  );
}
