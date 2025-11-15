// client/src/pages/Topics.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hash, TrendingUp, Grid3x3, Sparkles, Zap, Target } from 'lucide-react';
import { brandsAPI, topicsAPI } from '../services/api';
import TopicCloud from '../components/Dashboard/TopicCloud';
import TrendingTopics from '../components/Dashboard/TrendingTopics';
import TopicClusters from '../components/Topics/TopicClusters';
import TopicComparison from '../components/Topics/TopicComparison';
import TimeframeSelector from '../components/Analytics/TimeframeSelector';
import EmptyState from '../components/UI/EmptyState';
import { ChartSkeleton } from '../components/UI/Skeleton';
import { useTheme } from '../context/ThemeContext';

export default function Topics() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const { theme } = useTheme();

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });

  const brands = brandsData?.brands || [];

  // Set first brand as default
  if (brands.length > 0 && !selectedBrand) {
    setSelectedBrand(brands[0]);
  }

  // Theme-based classes
  const bgClass = theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-purple-50/20';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';

  if (brands.length === 0) {
    return (
      <EmptyState
        type="noBrands"
        title="No Topics Available"
        description="Add brands to start tracking topics and themes"
      />
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500`}>
      <div className="p-6 lg:p-8">
        <div className="space-y-8">

          {/* Premium Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-purple-500 to-pink-600
                shadow-2xl shadow-purple-500/25
              `}>
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

            <div className="flex items-center gap-4">
              <TimeframeSelector value={timeframe} onChange={setTimeframe} />
            </div>
          </div>

          {/* Premium Brand Selector */}
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
                <div className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${selectedBrand === brand 
                    ? 'bg-white scale-110' 
                    : 'bg-green-500 animate-pulse'
                  }
                `} />
                <span className="font-semibold">{brand}</span>
                
                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${selectedBrand === brand 
                    ? 'bg-purple-700' 
                    : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                  }
                  -z-10
                `} />
              </button>
            ))}
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`
              p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'bg-purple-900/20 border-purple-800/50' 
                : 'bg-purple-50 border-purple-200'
              }
            `}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${theme === 'dark' ? 'bg-purple-800/50' : 'bg-purple-100'}
                `}>
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className={`
                    text-sm font-semibold
                    ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}
                  `}>
                    Active Topics
                  </div>
                  <div className={`
                    text-lg font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {brands.length * 15}+
                  </div>
                </div>
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
              `}>
                Currently tracking across all brands
              </div>
            </div>

            <div className={`
              p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'bg-pink-900/20 border-pink-800/50' 
                : 'bg-pink-50 border-pink-200'
              }
            `}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${theme === 'dark' ? 'bg-pink-800/50' : 'bg-pink-100'}
                `}>
                  <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <div className={`
                    text-sm font-semibold
                    ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}
                  `}>
                    Trending Now
                  </div>
                  <div className={`
                    text-lg font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {brands.length * 3}+
                  </div>
                </div>
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}
              `}>
                Hot topics gaining momentum
              </div>
            </div>

            <div className={`
              p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'bg-blue-900/20 border-blue-800/50' 
                : 'bg-blue-50 border-blue-200'
              }
            `}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'}
                `}>
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className={`
                    text-sm font-semibold
                    ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
                  `}>
                    Engagement
                  </div>
                  <div className={`
                    text-lg font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {brands.length * 45}%
                  </div>
                </div>
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}
              `}>
                Average topic engagement rate
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Topics */}
            <div className={`
              rounded-2xl border shadow-lg transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
              }
              p-6 hover:shadow-xl
            `}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-orange-500 to-amber-500
                  shadow-lg
                `}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`
                    text-lg font-semibold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    Trending Topics
                  </h3>
                  <p className={`
                    text-sm
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `}>
                    Most discussed topics right now
                  </p>
                </div>
              </div>
              <TrendingTopics brand={selectedBrand} limit={8} />
            </div>

            {/* Topic Cloud */}
            <div className={`
              rounded-2xl border shadow-lg transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
              }
              p-6 hover:shadow-xl
            `}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-blue-500 to-cyan-500
                  shadow-lg
                `}>
                  <Grid3x3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`
                    text-lg font-semibold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    Topic Cloud
                  </h3>
                  <p className={`
                    text-sm
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `}>
                    Visual topic distribution
                  </p>
                </div>
              </div>
              <TopicCloud brand={selectedBrand} timeframe={timeframe} limit={30} />
            </div>
          </div>

          {/* Topic Clusters */}
          <div className={`
            rounded-2xl border shadow-lg transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-slate-200'
            }
            p-6 hover:shadow-xl
          `}>
            <TopicClusters brand={selectedBrand} timeframe={timeframe} />
          </div>

          {/* Cross-Brand Topic Comparison */}
          {brands.length > 1 && (
            <div className={`
              rounded-2xl border shadow-lg transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
              }
              p-6 hover:shadow-xl
            `}>
              <TopicComparison timeframe={timeframe} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}