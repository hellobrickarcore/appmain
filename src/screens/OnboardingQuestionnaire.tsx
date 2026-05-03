import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { 
  ChevronRight, 
  ChevronLeft, 
  Box, 
  Sparkles, 
  Layers, 
  Search, 
  Zap,
  CheckCircle2,
  Users,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { appStateService } from '../services/appStateService';

interface OnboardingQuestionnaireProps {
}

type StepId = 'welcome' | 'quantity' | 'interest' | 'problem' | 'analyzing' | 'email' | 'social' | 'success';

interface QuestionOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const QUANTITY_OPTIONS: QuestionOption[] = [
  { id: 'sets', label: 'A few sets', icon: <Box className="w-6 h-6" />, description: 'Under 1,000 bricks' },
  { id: 'bins', label: 'Big bins', icon: <Layers className="w-6 h-6" />, description: '1,000 - 10,000 bricks' },
  { id: 'mountain', label: 'A brick mountain', icon: <Layers className="w-6 h-6 text-orange-500" />, description: '10,000+ bricks' },
  { id: 'unknown', label: 'Not sure yet', icon: <Search className="w-6 h-6" />, description: "Let's find out!" },
];

const INTEREST_OPTIONS: QuestionOption[] = [
  { id: 'technic', label: 'Technic & Cars', icon: <Zap className="w-6 h-6 text-blue-400" /> },
  { id: 'architecture', label: 'City & Houses', icon: <Box className="w-6 h-6 text-emerald-400" /> },
  { id: 'mocs', label: 'MOCs & Custom', icon: <Sparkles className="w-6 h-6 text-yellow-400" /> },
  { id: 'starwars', label: 'Star Wars / Sci-Fi', icon: <Star className="w-6 h-6 text-purple-400" /> },
];

const PROBLEM_OPTIONS: QuestionOption[] = [
  { id: 'finding', label: 'Finding specific parts', icon: <Search className="w-6 h-6" />, description: 'Searching for that one 2x4...' },
  { id: 'ideas', label: 'Lack of inspiration', icon: <Sparkles className="w-6 h-6" />, description: 'What can I build with this?' },
  { id: 'sorting', label: 'Sorting chaos', icon: <Layers className="w-6 h-6" />, description: 'The bin is a mess' },
  { id: 'cataloging', label: 'Tracking my collection', icon: <Box className="w-6 h-6" />, description: "Don't know what I own" },
];

export const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = () => {
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  const steps: StepId[] = ['welcome', 'quantity', 'interest', 'problem', 'analyzing', 'email', 'social', 'success'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = (currentStepIndex / (steps.length - 1)) * 100;

  useEffect(() => {
    if (currentStep === 'analyzing') {
      const interval = setInterval(() => {
        setAnalyzingProgress((prev: number) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep('social'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 'success') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD600', '#FF7A30', '#2563EB', '#FFFFFF']
      });
    }
  }, [currentStep]);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    const nextStepMap: Record<string, StepId> = {
      welcome: 'quantity',
      quantity: 'interest',
      interest: 'problem',
      problem: 'analyzing',
      analyzing: 'email',
      email: 'social',
      social: 'success'
    };
    setTimeout(() => setCurrentStep(nextStepMap[currentStep]), 300);
  };

  const goBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex]);
    }
  };

  const finishOnboarding = () => {
    appStateService.navigate(Screen.SUBSCRIPTION);
  };

  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 animate-in fade-in zoom-in duration-500">
      <div className="mb-12 relative group">
        <div className="absolute inset-0 bg-white/10 blur-[40px] rounded-full animate-pulse" />
        <Logo size="xl" showText={false} className="relative z-10 transform -rotate-3" />
      </div>
      <h1 className="text-5xl font-black mb-6 tracking-tighter leading-none">
        Welcome to <br />
        <span className="text-orange-500">HelloBrick</span>
      </h1>
      <p className="text-slate-400 text-lg font-bold mb-12 max-w-[280px]">
        Let's turn your brick collection into a building powerhouse.
      </p>
      <div className="flex flex-col w-full gap-4">
        <button
          onClick={() => setCurrentStep('quantity')}
          className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
        >
          Let's Go!
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => appStateService.navigate(Screen.AUTH)}
          className="w-full py-4 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors"
        >
          Already have an account? <span className="text-white">Log In</span>
        </button>
      </div>
    </div>
  );

  const renderQuestion = (title: string, subtitle: string, options: QuestionOption[], questionId: string) => (
    <div className="flex-1 flex flex-col justify-start pt-12 px-8 animate-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-black mb-3 tracking-tight leading-none">{title}</h2>
      <p className="text-slate-400 font-bold text-lg mb-10">{subtitle}</p>
      
      <div className="space-y-4">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(questionId, option.id)}
            className={`w-full p-6 rounded-[28px] border-2 transition-all flex items-center gap-5 text-left active:scale-[0.97] ${
              answers[questionId] === option.id 
                ? 'border-orange-500 bg-orange-500/10' 
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              answers[questionId] === option.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {option.icon}
            </div>
            <div>
              <div className="font-black text-lg text-white leading-tight">{option.label}</div>
              {option.description && (
                <div className="text-slate-500 font-bold text-xs mt-0.5">{option.description}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 mb-8 relative">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
        <div 
          className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" 
          style={{ animationDuration: '1.5s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <BrainCircuit className="w-10 h-10 text-orange-500" />
        </div>
      </div>
      
      <h2 className="text-3xl font-black mb-4 tracking-tight leading-none">
        Mapping your <br />
        <span className="text-orange-500">brick potential</span>
      </h2>
      
      <div className="w-full bg-white/5 h-3 rounded-full mb-6 overflow-hidden border border-white/10">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-orange-500 transition-all duration-300 ease-out"
          style={{ width: `${analyzingProgress}%` }}
        />
      </div>
      
      <div className="space-y-3">
        <p className={`text-slate-400 font-bold transition-opacity duration-300 ${analyzingProgress > 10 ? 'opacity-100' : 'opacity-0'}`}>
          {analyzingProgress < 40 ? 'Analyzing inventory size...' : 
           analyzingProgress < 70 ? 'Optimizing building paths...' : 
           'Generating custom ideas...'}
        </p>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8">
        <Users className="w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-3xl font-black text-center mb-4 leading-tight text-white">Create your Account</h2>
      <p className="text-slate-400 text-center mb-8 font-bold">
        Enter your email to save your collection and build progress.
      </p>
      
      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          placeholder="builder@hellobrick.app"
          className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
        />
        {emailError && (
          <p className="text-red-400 text-sm font-bold text-center">{emailError}</p>
        )}
        
        <button
          onClick={() => {
            if (!email || !email.includes('@')) {
              setEmailError('Please enter a valid email address');
              return;
            }
            localStorage.setItem('hellobrick_userEmail', email);
            setCurrentStep('social');
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl font-black text-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
        >
          Confirm Email
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="flex-1 flex flex-col justify-center px-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-[40px] border border-white/10 relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="w-32 h-32" />
        </div>
        
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
          ))}
        </div>
        
        <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">
          Join 50,000+ <br />
          Master Builders
        </h2>
        
        <p className="text-slate-300 font-bold text-lg mb-8 italic">
          "HelloBrick changed how I build. I found pieces I thought were lost forever!"
          <br />
          <span className="text-slate-500 text-sm not-italic uppercase tracking-widest mt-2 block">— Alex, Lego Enthusiast</span>
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-slate-300 font-bold">Top 10 Education App</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-slate-300 font-bold">Industry leading AI detection</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setCurrentStep('success')}
        className="w-full bg-orange-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
      >
        Continue
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-10 animate-in zoom-in duration-500">
      <div className="w-32 h-32 bg-orange-500 rounded-[40px] flex items-center justify-center mb-10 shadow-3xl transform rotate-6 hover:rotate-0 transition-transform">
        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
      </div>
      
      <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">
        You're all set!
      </h2>
      
      <p className="text-slate-400 text-xl font-bold mb-12 max-w-[280px]">
        We've personalized your HelloBrick experience. Let's start building.
      </p>
      
      <button
        onClick={finishOnboarding}
        className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        Enter Workspace
        <Zap className="w-6 h-6 fill-current" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#050A18] flex flex-col font-sans overflow-hidden text-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      
      {/* Progress Bar & Header */}
      {currentStep !== 'welcome' && currentStep !== 'success' && currentStep !== 'analyzing' && (
        <div className="relative z-20 px-8 pt-[max(env(safe-area-inset-top),2rem)] shrink-0">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-slate-500 font-black text-xs uppercase tracking-widest">
              Step {currentStepIndex} of {steps.length - 2}
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
          
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'quantity' && renderQuestion(
          "Great to meet you!", 
          "Roughly how many bricks do you own?", 
          QUANTITY_OPTIONS, 
          'quantity'
        )}
        {currentStep === 'interest' && renderQuestion(
          "What's your vibe?", 
          "Selection helps us tailor your build paths.", 
          INTEREST_OPTIONS, 
          'interest'
        )}
        {currentStep === 'problem' && renderQuestion(
          "The struggle is real.", 
          "What's the hardest part of building for you?", 
          PROBLEM_OPTIONS, 
          'problem'
        )}
        {currentStep === 'analyzing' && renderAnalyzing()}
        {currentStep === 'email' && renderEmail()}
        {currentStep === 'social' && renderSocial()}
        {currentStep === 'success' && renderSuccess()}
      </div>

      {/* Footer Branding */}
      <div className="p-8 flex justify-center opacity-20 relative z-10 shrink-0">
        <Logo size="sm" showText={false} light />
      </div>
    </div>
  );
};

// Add BrainCircuit to lucide imports since I used it manually but forgot to include it in the top destructured import
const BrainCircuit = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 3 3 0 1 0 5.32 0 4 4 0 0 0 .52-8.105 4 4 0 0 0-2.527-5.77A3 3 0 0 0 12 5Z"/>
    <path d="M9 13a4.5 4.5 0 0 0 3-4"/>
    <path d="M6.003 5.125A3 3 0 1 0 12 5"/>
    <path d="M11 12h2"/>
    <path d="M11 16h2"/>
    <path d="M15 12h2"/>
    <path d="M15 16h2"/>
    <path d="M8 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/>
  </svg>
);
