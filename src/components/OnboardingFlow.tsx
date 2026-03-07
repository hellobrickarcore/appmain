import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { renderHelloBrick } from './BrandedText';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to HelloBrick!",
      description: "Turn your brick collection into an adventure. Scan, sort, and discover with ease.",
      image: "🧱",
      buttonText: "Hello!",
    },
    {
      title: "Scan Your Bricks",
      description: "Point your camera at your bricks and watch the magic happen. We'll identify every piece instantly.",
      image: "📸",
      buttonText: "Got it!",
    },
    {
      title: "Complete Quests",
      description: "Turn today's mess into a game. Find all red bricks, sort by color, or complete daily challenges.",
      image: "🎯",
      buttonText: "Let's play!",
    },
    {
      title: "Build Your Streak",
      description: "Come back daily to keep your streak alive and earn bonus XP. The longer the streak, the better the rewards!",
      image: "🔥",
      buttonText: "Start building!",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('hellobrick_onboarding_complete', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hellobrick_onboarding_complete', 'true');
    onComplete();
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 z-50 flex items-center justify-center p-4 safe-area-inset">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative mx-4">
        {/* Skip Button - Larger touch target for iOS */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-3 hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors touch-manipulation"
          aria-label="Skip onboarding"
        >
          <X size={24} className="text-slate-600" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Image/Icon - Responsive sizing */}
          <div className="text-6xl sm:text-8xl mb-2 sm:mb-4 animate-bounce">
            {current.image}
          </div>

          {/* Title - Responsive font sizing */}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 px-2">
            {current.title.includes('HelloBrick') ? (
              <>
                Welcome to {renderHelloBrick('lg')}!
              </>
            ) : (
              current.title
            )}
          </h2>

          {/* Description - Optimized for readability */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed px-2">
            {current.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pt-2 sm:pt-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-8 bg-orange-500'
                    : i < currentStep
                    ? 'w-2 bg-orange-300'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Button - iOS optimized with larger touch target */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 sm:py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-[0.98] touch-manipulation min-h-[56px]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {current.buttonText}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

