// client/src/components/Dashboard/TrendingTopics.jsx
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, ArrowUp, Zap, Sparkles, Target } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';

export default function TrendingTopics({ brand, limit = 8 }) {
  const { theme } = useTheme();
  
  const { data, isLoading } = useQuery({
    queryKey: ['trending-topics', brand, limit],
    queryFn: () => topicsAPI.getBrandTopics(brand, '24h', limit).then(res => res.data),
    enabled: !!brand,
    refetchInterval: 30000,
  });

  if (isLoading) return <ChartSkeleton />;

  if (!data || !data.trending || data.trending.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Trending Topics"
        description="Trending topics will appear here as conversations evolve"
        className="h-64"
      />
    );
  }

  const trending = data.trending;

  const getTrendColor = (ratio) => {
    if (ratio >= 5) return 'text-red-600 dark:text-red-400';
    if (ratio >= 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getTrendBadge = (ratio) => {
    if (ratio >= 5) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    if (ratio >= 2) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  };

  const getRankGradient = (index) => {
    if (index === 0) return 'from-amber-500 to-yellow-500';
    if (index === 1) return 'from-slate-400 to-slate-500';
    if (index === 2) return 'from-orange-500 to-amber-500';
    return 'from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'negative': return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      default: return theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const trendingCount = trending.filter(t => t.isTrending).length;

  return (
    <div id="trending-topics" className={`
      rounded-2xl border shadow-lg transition-all duration-300
      ${theme === 'dark' 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
      }
      p-6 hover:shadow-xl
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-orange-500 to-red-500
            shadow-lg
          `}>
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className={`
              text-lg font-semibold
              ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
            `}>
              Trending Now
            </h3>
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Hot topics gaining momentum
            </p>
          </div>
        </div>

        {/* Trending Counter */}
        <div className={`
          px-3 py-1.5 rounded-xl text-sm font-bold backdrop-blur-sm border
          ${theme === 'dark' 
            ? 'bg-red-900/30 border-red-800/50 text-red-300' 
            : 'bg-red-100 border-red-200 text-red-700'
          }
        `}>
          {trendingCount} trending
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {trending.map((topic, index) => (
          <div
            key={topic.keyword}
            className="group relative"
          >
            {/* Top Rank Glow */}
            {index < 3 && (
              <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                transition-opacity duration-300 pointer-events-none
                bg-gradient-to-r from-amber-500/10 to-orange-500/10
                -z-10
              `} />
            )}
            
            <div className={`
              p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300
              group-hover:scale-105 group-hover:shadow-lg
              ${topic.isTrending 
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-800/50' 
                  : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                : theme === 'dark'
                  ? 'bg-slate-700/50 border-slate-600/50'
                  : 'bg-slate-50 border-slate-200'
              }
            `}>
              <div className="flex items-start justify-between gap-4">
                {/* Left: Topic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Rank Badge */}
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center
                      bg-gradient-to-br ${getRankGradient(index)}
                      text-white font-bold text-sm shadow-lg
                    `}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`
                          font-bold text-lg truncate
                          ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                        `}>
                          {topic.keyword}
                        </h4>
                        
                        {/* Trend Badges */}
                        <div className="flex items-center gap-1">
                          {topic.isTrending && (
                            <span className={`
                              px-2 py-1 text-xs font-bold rounded-full border
                              ${getTrendBadge(topic.trendRatio)}
                            `}>
                              {topic.trendRatio >= 5 ? '🔥 HOT' : '📈 TRENDING'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className={`w-4 h-4 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <span className={`
                            font-medium
                            ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}
                          `}>
                            {topic.recentCount?.toLocaleString() || topic.count?.toLocaleString()}
                          </span>
                          <span className={`
                            ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}
                          `}>
                            mentions
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-lg">
                            {getSentimentIcon(topic.sentiment)}
                          </span>
                          <span className={`font-medium capitalize ${getSentimentColor(topic.sentiment)}`}>
                            {topic.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Breakdown Bar */}
                  {topic.sentimentBreakdown && (
                    <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 transition-all duration-500"
                        style={{ 
                          width: `${(topic.sentimentBreakdown.positive / topic.count * 100)}%` 
                        }}
                        title={`${topic.sentimentBreakdown.positive} positive`}
                      />
                      <div 
                        className="bg-slate-400 transition-all duration-500"
                        style={{ 
                          width: `${(topic.sentimentBreakdown.neutral / topic.count * 100)}%` 
                        }}
                        title={`${topic.sentimentBreakdown.neutral} neutral`}
                      />
                      <div 
                        className="bg-red-500 transition-all duration-500"
                        style={{ 
                          width: `${(topic.sentimentBreakdown.negative / topic.count * 100)}%` 
                        }}
                        title={`${topic.sentimentBreakdown.negative} negative`}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Trend Indicator */}
                <div className="text-right flex-shrink-0">
                  <div className={`flex items-center gap-1 font-bold ${getTrendColor(topic.trendRatio)}`}>
                    <ArrowUp className="w-5 h-5" />
                    <span className="text-xl">{topic.trendRatio}x</span>
                  </div>
                  <div className={`
                    text-xs font-medium
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `}>
                    vs previous
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Summary */}
      <div className={`
        mt-6 p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'}
            `}>
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className={`
                font-semibold
                ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
              `}>
                {trendingCount} topics trending up
              </div>
              <div className={`
                text-sm
                ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
              `}>
                Across all tracked conversations
              </div>
            </div>
          </div>
          
          <Target className={`w-5 h-5 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
      </div>
    </div>
  );
}