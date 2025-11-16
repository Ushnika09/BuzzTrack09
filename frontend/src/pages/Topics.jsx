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

export default function Topics() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const { theme } = useTheme();

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });

  const brands = brandsData?.brands || [];

  // Auto-select first brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  const { data: topicStats } = useQuery({
    queryKey: ['brand-topics-stats', selectedBrand, timeframe],
    queryFn: async () => {
      const response = await topicsAPI.getBrandTopics(selectedBrand, timeframe, 50);
      return response.data;
    },
    enabled: !!selectedBrand,
  });

  const activeTopics = topicStats?.topics?.length || 0;
  const trendingCount = topicStats?.topics?.filter(t => {
    const maxCount = Math.max(...(topicStats?.topics?.map(topic => topic.count) || [1]));
    return t.count >= maxCount * 0.3;
  }).length || 0;
  
  const avgEngagement = topicStats?.topics?.reduce((sum, t) => sum + (t.percentage || 0), 0) / Math.max(activeTopics, 1) || 0;

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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl shadow-purple-500/25`}>
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

            <div data-tour="timeframe-selector">
              <TimeframeSelector value={timeframe} onChange={setTimeframe} />
            </div>
          </div>

          <div data-tour="brand-pills" className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`
                  group relative px-6 py-3.5 rounded-full font-medium flex items-center gap-2.5 border-2 transition-all duration-300 min-w-max
                  ${selectedBrand === brand
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xs shadow-purple-600/30 border-purple-600'
                    : `${cardBg} border ${borderClass} ${mutedText} hover:border-purple-300 dark:hover:border-purple-700 hover:scale-102`
                  }
                `}
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedBrand === brand ? 'bg-white scale-110' : 'bg-green-500 animate-pulse'}`} />
                <span className="font-semibold">{brand}</span>
                <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${selectedBrand === brand ? 'bg-purple-700' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} -z-10`} />
              </button>
            ))}
          </div>

          <div data-tour="topic-insights" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Topics Card */}
            <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-800/50' : 'bg-purple-200'}`}>
                  <Target className="w-5 h h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>Active Topics</div>
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{activeTopics}+</div>
                </div>
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>Topics being discussed in {timeframe}</div>
            </div>

            {/* Trending Now Card */}
            <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-pink-900/20 border-pink-800/50' : 'bg-pink-50 border-pink-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-pink-800/50' : 'bg-pink-200'}`}>
                  <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}`}>Trending Now</div>
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{trendingCount}</div>
                </div>
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>Hot topics gaining momentum</div>
            </div>

            {/* Avg Distribution Card */}
            <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-200'}`}>
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>Avg Distribution</div>
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{avgEngagement.toFixed(1)}%</div>
                </div>
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Average topic mention percentage</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div data-tour="trending-topics" className={`rounded-2xl border shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 hover:shadow-xl`}>
              <TrendingTopics brand={selectedBrand} limit={8} timeframe={timeframe} />
            </div>

            <div data-tour="topic-cloud" className={`rounded-2xl border shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 hover:shadow-xl`}>
              <TopicCloud brand={selectedBrand} timeframe={timeframe} limit={30} />
            </div>
          </div>

          <div data-tour="topic-clusters" className={`rounded-2xl border shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 hover:shadow-xl`}>
            <TopicClusters brand={selectedBrand} timeframe={timeframe} />
          </div>

        </div>
      </div>
    </div>
  );
}