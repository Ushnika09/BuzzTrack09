// client/src/components/OnboardingTour.jsx
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
  {
    title: 'Welcome to BuzzTrack! 🎉',
    description: 'Your all-in-one platform for tracking brand mentions across the web in real-time.',
    position: 'center',
  },
  {
    title: 'Real-time Mentions',
    description: 'Monitor what people are saying about your brands on Reddit, news sites, and social media.',
    target: '#mention-feed',
    position: 'right',
  },
  {
    title: 'Sentiment Analysis',
    description: 'Instantly see whether mentions are positive, neutral, or negative with our AI-powered analysis.',
    target: '#sentiment-chart',
    position: 'bottom',
  },
  {
    title: 'Spike Detection',
    description: 'Get alerted when there\'s unusual conversation activity about your brand.',
    target: '#spike-alerts',
    position: 'bottom',
  },
  {
    title: 'Add Brands',
    description: 'Click here to add new brands to track. You can monitor multiple brands simultaneously.',
    target: '#add-brand-button',
    position: 'left',
  },
  {
    title: 'Customize Your Experience',
    description: 'Use filters, toggle dark mode, and drag widgets to arrange your perfect dashboard.',
    position: 'center',
  },
];

export default function OnboardingTour({ currentStep, onNext, onPrev, onComplete, onSkip }) {
  if (currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>

      {/* Tour Card */}
      <div
        className={`
          fixed z-50 w-96 max-w-[calc(100vw-2rem)]
          bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6
          transform transition-all duration-300
          ${step.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
          ${step.position === 'right' ? 'top-1/2 right-8 -translate-y-1/2' : ''}
          ${step.position === 'bottom' ? 'bottom-8 left-1/2 -translate-x-1/2' : ''}
          ${step.position === 'left' ? 'top-1/2 left-8 -translate-y-1/2' : ''}
        `}
      >
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="flex gap-1.5 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`
                h-1.5 flex-1 rounded-full transition-colors duration-300
                ${index <= currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-slate-200 dark:bg-slate-700'
                }
              `}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {step.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={onPrev}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={isLastStep ? onComplete : onNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step Counter */}
        <div className="text-center mt-4 text-xs text-slate-500 dark:text-slate-400">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </>
  );
}