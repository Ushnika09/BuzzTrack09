// client/src/components/OnboardingTour.jsx
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Define steps for each route
const tourSteps = {
  '/': [ // Dashboard/Home
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
      title: 'Switch Between Brands',
      description: 'Quickly switch between your tracked brands to view their individual insights.',
      target: '[data-tour="brand-pills"]',
      position: 'bottom',
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
      title: 'Customize Your Dashboard',
      description: 'Drag widgets to rearrange your layout. Your changes are saved automatically!',
      position: 'center',
      highlight: false,
    },
  ],
  '/analytics': [ // Analytics Page
    {
      title: 'Welcome to Analytics! 📊',
      description: 'Comprehensive insights and comparisons across all your tracked brands.',
      position: 'center',
      highlight: false,
    },
    {
      title: 'Key Metrics Overview',
      description: 'View aggregated stats including total mentions, engagement rates, and sentiment distribution.',
      target: '[data-tour="analytics-metrics"]',
      position: 'bottom',
      highlight: true,
    },
    
    {
      title: 'Timeframe Selector',
      description: 'Adjust the time period to analyze different date ranges (1H to 30D).',
      target: '[data-tour="timeframe-selector"]',
      position: 'bottom-left',
      highlight: true,
    },
    {
      title: 'Export Your Data',
      description: 'Download analytics data in JSON format for further analysis or reporting.',
      target: '[data-tour="export-button"]',
      position: 'bottom-left',
      highlight: true,
    },
    {
      title: 'Platform Breakdown',
      description: 'See which platforms (Reddit, News, Twitter) are driving the most conversations.',
      target: '[data-tour="platform-breakdown"]',
      position: 'top',
      highlight: true,
    },
    {
      title: 'Top Performing Brands',
      description: 'Compare performance across all tracked brands to identify leaders and trends.',
      target: '[data-tour="top-brands"]',
      position: 'top',
      highlight: true,
    },
    {
      title: 'Source Comparison',
      description: 'Analyze how different data sources contribute to your overall mention volume.',
      target: '[data-tour="source-comparison"]',
      position: 'top',
      highlight: true,
    },
    {
      title: 'Brand Comparison Chart',
      description: 'Compare mention volumes across brands side-by-side to identify trends and opportunities.',
      target: '[data-tour="brand-comparison"]',
      position: 'top',
      highlight: true,
    },
    {
      title: 'Sentiment Trends',
      description: 'Track sentiment changes over time to understand brand perception evolution.',
      target: '[data-tour="sentiment-trends"]',
      position: 'top',
      highlight: true,
    },
    
    
    {
      title: 'Analytics Complete! ✨',
      description: 'Use these insights to make data-driven decisions about your brand strategy.',
      position: 'center',
      highlight: false,
    },
  ],
  '/topics': [ // Topics Page
    {
      title: 'Welcome to Topics! 🔍',
      description: 'Discover what people are talking about and identify emerging themes.',
      position: 'center',
      highlight: false,
    },
    {
      title: 'Topic Insights',
      description: 'Quick overview of active topics, trending conversations, and average distribution.',
      target: '[data-tour="topic-insights"]',
      position: 'bottom',
      highlight: true,
    },
    {
      title: 'Trending Topics',
      description: 'See what\'s hot right now with real-time trending indicators and velocity tracking.',
      target: '[data-tour="trending-topics"]',
      position: 'bottom',
      highlight: true,
    },
    {
      title: 'Topic Cloud',
      description: 'Visual word cloud showing topic frequency - larger words appear more often!',
      target: '[data-tour="topic-cloud"]',
      position: 'bottom',
      highlight: true,
    },
    {
      title: 'Topic Clusters',
      description: 'Topics grouped by theme with sample mentions. Click to expand and explore.',
      target: '[data-tour="topic-clusters"]',
      position: 'top',
      highlight: true,
    },
    {
      title: 'Brand Switcher',
      description: 'Switch between brands to analyze topics specific to each one.',
      target: '[data-tour="brand-pills"]',
      position: 'bottom',
      highlight: true,
    },
    {
      title: 'Timeframe Control',
      description: 'Adjust the analysis period to see how topics evolve over time.',
      target: '[data-tour="timeframe-selector"]',
      position: 'bottom-left',
      highlight: true,
    },
    {
      title: 'Topics Mastered! 🎯',
      description: 'Use topic analysis to understand customer concerns and identify opportunities.',
      position: 'center',
      highlight: false,
    },
  ],
};

export default function OnboardingTour({ currentStep, onNext, onPrev, onComplete, onSkip }) {
  const location = useLocation();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAlignment, setTooltipAlignment] = useState('center');
  const [currentRoute, setCurrentRoute] = useState(location.pathname);

  const steps = tourSteps[currentRoute] || tourSteps['/'];

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (currentStep >= steps.length) return;

    const step = steps[currentStep];
    
    if (step.target) {
      const timer = setTimeout(() => {
        const element = document.querySelector(step.target);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 320;
        const spacing = 20;

        let top = 0;
        let left = 0;
        let alignment = 'center';

        // Position logic (unchanged)
        switch (step.position) {
          case 'top':
            top = rect.top - tooltipHeight - spacing;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            alignment = 'bottom';
            break;
          case 'bottom':
            top = rect.bottom + spacing;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            alignment = 'top';
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

        // Keep in viewport
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (left < 20) left = 20;
        if (left + tooltipWidth > vw - 20) left = vw - tooltipWidth - 20;
        if (top < 20) top = 20;
        if (top + tooltipHeight > vh - 20) top = vh - tooltipHeight - 20;

        setTooltipPosition({ top, left });
        setTooltipAlignment(alignment);

        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        // HIGHLIGHT: Apply strong highlight
        element.classList.add('tour-highlight');
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  // Cleanup
  useEffect(() => {
    return () => {
      document.querySelectorAll('[data-tour]').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, []);

  if (currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isCentered = step.position === 'center';

  return (
    <>
      {/* BACKDROP – now BELOW tooltip */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]" />

      {/* SPOTLIGHT HOLE – cuts out highlighted area */}
      {step.highlight && step.target && (
        <div className="fixed inset-0 pointer-events-none z-[1001]">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {(() => {
                  const el = document.querySelector(step.target);
                  if (!el) return null;
                  const r = el.getBoundingClientRect();
                  const padding = 12;
                  return (
                    <rect
                      x={r.left - padding}
                      y={r.top - padding}
                      width={r.width + padding * 2}
                      height={r.height + padding * 2}
                      fill="black"
                      rx="16"
                    />
                  );
                })()}
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#spotlight-mask)" />
          </svg>

          {/* Pulsing Glow Border */}
          {(() => {
            const el = document.querySelector(step.target);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const padding = 8;
            return (
              <div
                className="absolute rounded-2xl animate-pulse"
                style={{
                  top: r.top - padding,
                  left: r.left - padding,
                  width: r.width + padding * 2,
                  height: r.height + padding * 2,
                  boxShadow: '0 0 30px 10px rgba(99, 102, 241, 0.6)',
                  border: '3px solid rgba(99, 102, 241, 0.8)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                }}
              />
            );
          })()}
        </div>
      )}

      {/* TOUR TOOLTIP – HIGHEST z-index */}
      <div
        className={`
          fixed z-[1002] w-[400px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-800
          rounded-2xl shadow-2xl border-2 border-indigo-500/30 overflow-hidden
          ${isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        `}
        style={!isCentered ? { top: tooltipPosition.top, left: tooltipPosition.left } : {}}
      >
        {/* Gradient Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl -z-10" />

        {/* Arrow */}
        {!isCentered && (
          <div className={`
            absolute w-5 h-5 bg-white dark:bg-slate-800 rotate-45 border-2 border-indigo-500/30
            ${tooltipAlignment === 'top' ? '-top-3 left-1/2 -translate-x-1/2 border-t-0 border-l-0' : ''}
            ${tooltipAlignment === 'bottom' ? '-bottom-3 left-1/2 -translate-x-1/2 border-b-0 border-r-0' : ''}
          `} />
        )}

        <div className="p-6">
          <button onClick={onSkip} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-1.5 mb-5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={onSkip} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Skip tour
            </button>

            <div className="flex gap-3">
              {!isFirstStep && (
                <button onClick={onPrev} className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={isLastStep ? onComplete : onNext}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isLastStep ? 'Get Started' : 'Next'} {isLastStep ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-center mt-4 text-xs text-slate-500">
            Step {currentStep + 1} of {steps.length} • {currentRoute === '/' ? 'Dashboard' : currentRoute === '/analytics' ? 'Analytics' : 'Topics'}
          </div>
        </div>
      </div>
    </>
  );
}