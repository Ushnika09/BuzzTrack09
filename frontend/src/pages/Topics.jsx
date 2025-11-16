// client/src/pages/Topics.jsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hash, TrendingUp, Grid3x3, Sparkles, Zap, Target } from 'lucide-react';
import { brandsAPI, topicsAPI } from '../services/api';
import TopicCloud from '../components/Dashboard/TopicCloud';
import TrendingTopics from '../components/Dashboard/TrendingTopics';
import TopicClusters from '../components/Topics/TopicClusters';
import TimeframeSelector from '../components/Analytics/TimeframeSelector';
import EmptyState from '../components/UI/EmptyState';
import { useTheme } from '../context/ThemeContext';
import OnboardingTour from '../components/OnboardingTour';

const tourSteps = [
  {
    title: 'Welcome to Topics!',
    description: 'Discover what people are actually talking about — powered by AI.',
    position: 'center',
    highlight: false,
  },
  {
    title: 'Trending Topics',
    description: 'See the hottest topics right now — ranked by velocity and volume.',
    target: '[data-tour="trending"]',
    position: 'bottom',
    highlight: true,
  },
  {
    title: 'Topic Cloud',
    description: 'Visual map of conversation weight — bigger = more mentions.',
    target: '[data-tour="cloud"]',
    position: 'right',
    highlight: true,
  },
  {
    title: 'AI Topic Clusters',
    description: 'Smart grouping of related conversations into themes.',
    target: '[data-tour="clusters"]',
    position: 'top',
    highlight: true,
  },
  {
    title: 'Timeframe Control',
    description: 'Switch between 1h, 24h, 7d to see how topics evolve.',
    target: '[data-tour="timeframe"]',
    position: 'left',
    highlight: true,
  },
  {
    title: 'You\'re Ready!',
    description: 'Explore, filter, and dive deep into any topic. You own the conversation now.',
    position: 'center',
    highlight: false,
  },
];

export default function Topics() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });

  const brands = brandsData?.brands || [];

  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  // Show tour only once (you can tie this to localStorage later)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('topicsTourSeen');
    if (!hasSeenTour && selectedBrand) {
      setTimeout(() => setShowTour(true), 800);
    }
  }, [selectedBrand]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, tourSteps.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleComplete = () => {
    setShowTour(false);
    localStorage.setItem('topicsTourSeen', 'true');
  };

  const bgClass = theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-purple-50/20';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';

  if (brands.length === 0) {
    return <EmptyState type="noBrands" title="No Topics Available" description="Add brands to start tracking topics and themes" />;
  }

  return (
    <>
      <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500`}>
        <div className="p-6 lg:p-8">
          <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl shadow-purple-500/25">
                  <Hash className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Topic Analysis
                  </h1>
                  <p className={`mt-2 ${mutedText} flex items-center gap-2`}>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Discover what people are talking about
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4" data-tour="timeframe">
                <TimeframeSelector value={timeframe} onChange={setTimeframe} />
              </div>
            </div>

            {/* Brand Selector */}
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`
                    group relative px-6 py-3.5 rounded-full font-medium flex items-center gap-2.5 border-2 transition-all duration-300 min-w-max
                    ${selectedBrand === brand
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 border-purple-600 scale-105'
                      : `${cardBg} border ${borderClass} ${mutedText} hover:border-purple-300 dark:hover:border-purple-700 hover:scale-102`
                    }
                  `}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${selectedBrand === brand ? 'bg-white' : 'bg-green-500 animate-pulse'}`} />
                  <span className="font-semibold">{brand}</span>
                </button>
              ))}
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ... your insight cards ... */}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div data-tour="trending" className={`rounded-2xl border shadow-lg ${cardBg} ${borderClass} p-6 hover:shadow-xl transition-all`}>
                <TrendingTopics brand={selectedBrand} limit={8} timeframe={timeframe} />
              </div>

              <div data-tour="cloud" className={`rounded-2xl border shadow-lg ${cardBg} ${borderClass} p-6 hover:shadow-xl transition-all`}>
                <TopicCloud brand={selectedBrand} timeframe={timeframe} limit={30} />
              </div>
            </div>

            <div data-tour="clusters" className={`rounded-2xl border shadow-lg ${cardBg} ${borderClass} p-6 hover:shadow-xl transition-all`}>
              <TopicClusters brand={selectedBrand} timeframe={timeframe} />
            </div>

          </div>
        </div>
      </div>

      {/* Onboarding Tour — Same premium style as Dashboard */}
      {showTour && (
        <OnboardingTour
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onComplete={handleComplete}
          onSkip={handleComplete}
          steps={tourSteps}
        />
      )}
    </>
  );
}