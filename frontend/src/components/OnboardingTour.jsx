import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  {
    title: 'Welcome to BuzzTrack! 🎉',
    description: 'Your all-in-one platform for tracking brand mentions across the web in real-time.',
    position: 'center',
    highlight: false,
  },
  {
    title: 'Quick Stats Overview',
    description: 'Monitor total mentions, sentiment breakdown, and engagement metrics at a glance.',
    target: '[data-tour="stats"]',
    position: 'bottom',
    highlight: true,
  },
  {
    title: 'Spike Detection',
    description: 'Get instant alerts when there\'s unusual conversation activity about your brand.',
    target: '[data-tour="spike"]',
    position: 'bottom',
    highlight: true,
  },
  {
    title: 'Sentiment Analysis',
    description: 'See the breakdown of positive, neutral, and negative mentions with our AI-powered analysis.',
    target: '[data-tour="sentiment"]',
    position: 'top',
    highlight: true,
  },
  {
    title: 'Mention Volume',
    description: 'Track mention trends over time and identify peak conversation periods.',
    target: '[data-tour="volume"]',
    position: 'top',
    highlight: true,
  },
  {
    title: 'Source Breakdown',
    description: 'See where your mentions are coming from - Reddit, news sites, and social media.',
    target: '[data-tour="sources"]',
    position: 'top',
    highlight: true,
  },
  {
    title: 'Real-time Mention Feed',
    description: 'Browse all mentions in real-time with full content, sentiment, and engagement data.',
    target: '[data-tour="feed"]',
    position: 'top',
    highlight: true,
  },
  {
    title: 'Add More Brands',
    description: 'Click here to add new brands to track. Monitor multiple brands simultaneously.',
    target: '[data-tour="add-brand"]',
    position: 'bottom-left',
    highlight: true,
  },
  {
    title: 'Switch Between Brands',
    description: 'Quickly switch between your tracked brands to view their individual insights.',
    target: '[data-tour="brand-pills"]',
    position: 'bottom',
    highlight: true,
  },
  {
    title: 'You\'re All Set! ✨',
    description: 'Drag widgets to rearrange your dashboard, toggle dark mode, and explore advanced analytics in the sidebar.',
    position: 'center',
    highlight: false,
  },
];

export default function OnboardingTour({ currentStep, onNext, onPrev, onComplete, onSkip }) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAlignment, setTooltipAlignment] = useState('center');

  useEffect(() => {
    if (currentStep >= steps.length) return;

    const step = steps[currentStep];
    
    if (step.target) {
      const element = document.querySelector(step.target);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 300;
        const spacing = 20;
        
        let top = 0;
        let left = 0;
        let alignment = 'center';

        switch (step.position) {
          case 'top':
            top = rect.top - tooltipHeight - spacing;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            alignment = 'bottom';
            break;
          case 'bottom':
            top = rect.bottom + spacing;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            alignment = 'top';
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - spacing;
            alignment = 'right';
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + spacing;
            alignment = 'left';
            break;
          case 'bottom-left':
            top = rect.bottom + spacing;
            left = rect.left;
            alignment = 'top';
            break;
          case 'bottom-right':
            top = rect.bottom + spacing;
            left = rect.right - tooltipWidth;
            alignment = 'top';
            break;
          default:
            alignment = 'center';
        }

        // Keep tooltip within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 20) left = 20;
        if (left + tooltipWidth > viewportWidth - 20) {
          left = viewportWidth - tooltipWidth - 20;
        }
        if (top < 20) top = 20;
        if (top + tooltipHeight > viewportHeight - 20) {
          top = viewportHeight - tooltipHeight - 20;
        }

        setTooltipPosition({ top, left });
        setTooltipAlignment(alignment);

        // Scroll element into view smoothly
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [currentStep]);

  if (currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isCentered = step.position === 'center';

  return (
    <>
      {/* Backdrop Overlay */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-xs z-[100] animate-in fade-in duration-300" />

      {/* Highlight Spotlight */}
      {step.highlight && step.target && (
        <div
          className="fixed z-[101] pointer-events-none animate-in fade-in duration-500"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.3s ease-out',
          }}
          onLoad={(e) => {
            const element = document.querySelector(step.target);
            if (element) {
              const rect = element.getBoundingClientRect();
              e.currentTarget.style.top = `${rect.top - 8}px`;
              e.currentTarget.style.left = `${rect.left - 8}px`;
              e.currentTarget.style.width = `${rect.width + 16}px`;
              e.currentTarget.style.height = `${rect.height + 16}px`;
              e.currentTarget.style.borderRadius = '16px';
            }
          }}
        />
      )}

      {/* Tour Card */}
      <div
        className={`
          fixed z-[102] w-[400px] max-w-[calc(100vw-2rem)]
          bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-blue-500/20
          transform transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in
          ${isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        `}
        style={!isCentered ? {
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        } : {}}
      >
        {/* Pointer Arrow */}
        {!isCentered && (
          <div
            className={`
              absolute w-4 h-4 bg-white dark:bg-slate-800 border-blue-500/20
              transform rotate-45
              ${tooltipAlignment === 'top' ? '-top-2 left-1/2 -translate-x-1/2 border-t-2 border-l-2' : ''}
              ${tooltipAlignment === 'bottom' ? '-bottom-2 left-1/2 -translate-x-1/2 border-b-2 border-r-2' : ''}
              ${tooltipAlignment === 'left' ? '-left-2 top-1/2 -translate-y-1/2 border-l-2 border-b-2' : ''}
              ${tooltipAlignment === 'right' ? '-right-2 top-1/2 -translate-y-1/2 border-r-2 border-t-2' : ''}
            `}
          />
        )}

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl -z-10" />

        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            aria-label="Skip tour"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Dots */}
          <div className="flex gap-1.5 mb-5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-300
                  ${index < currentStep 
                    ? 'bg-green-500' 
                    : index === currentStep
                    ? 'bg-blue-600 scale-110'
                    : 'bg-slate-200 dark:bg-slate-700'
                  }
                `}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onSkip}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors px-2"
            >
              Skip tour
            </button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={onPrev}
                  className="px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 font-medium border border-slate-200 dark:border-slate-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <button
                onClick={isLastStep ? onComplete : onNext}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 active:scale-95"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </>
  );
}