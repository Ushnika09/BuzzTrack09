// client/src/components/Dashboard/TrendingTopics.jsx
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, ArrowUp, Zap, Sparkles, Target, Clock } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';

export default function TrendingTopics({ brand, limit = 8, timeframe = '24h' }) {
  const { theme } = useTheme();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-topics-trending', brand, timeframe, limit],
    queryFn: async () => {
      const response = await topicsAPI.getBrandTopics(brand, timeframe, limit);
      return response.data;
    },
    enabled: !!brand,
    refetchInterval: 30000,
  });

  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';

  if (isLoading) return <ChartSkeleton className="h-96" />;

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to Load Trending Topics"
        description={error.message || "Unable to fetch trending topics"}
        className="h-96"
      />
    );
  }

  if (!data || !data.topics || data.topics.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Trending Topics"
        description="Trending topics will appear here as conversations evolve"
        icon={<Flame className="w-16 h-16 text-orange-500 animate-pulse" />}
        className="h-96"
      />
    );
  }

  // Sort topics by count to show most mentioned first
  const topics = [...data.topics].sort((a, b) => b.count - a.count).slice(0, limit);

  const getTrendColor = (count, maxCount) => {
    const ratio = count / maxCount;
    if (ratio >= 0.7) return 'text-rose-600 dark:text-rose-400';
    if (ratio >= 0.4) return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getTrendBadge = (count, maxCount) => {
    const ratio = count / maxCount;
    if (ratio >= 0.7) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    if (ratio >= 0.4) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
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
      case 'positive': return theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600';
      case 'negative': return theme === 'dark' ? 'text-rose-400' : 'text-rose-600';
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

  const maxCount = Math.max(...topics.map(t => t.count));
  const trendingCount = topics.filter(t => t.count >= maxCount * 0.3).length;

  return (
    <div className="space-y-4">
      {/* Premium Header with Real-Time Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            relative w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-orange-500 to-red-500 shadow-lg
          `}>
            <Flame className="w-6 h-6 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${textClass}`}>
              Trending Now
            </h3>
            <p className={`text-sm ${mutedText} flex items-center gap-1`}>
              <Clock className="w-3 h-3" />
              Live • {topics.length} topics
            </p>
          </div>
        </div>

        {/* Trending Counter Badge */}
        <div className={`
          px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm border shadow-lg
          ${theme === 'dark' 
            ? 'bg-rose-900/30 border-rose-800/50 text-rose-300' 
            : 'bg-rose-100 border-rose-200 text-rose-700'
          }
        `}>
          🔥 {trendingCount} hot
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {topics.map((topic, index) => {
          const isTopTrending = index < 3;
          const trendRatio = topic.count / maxCount;

          return (
            <div
              key={topic.keyword}
              className="group relative"
            >
              {/* Premium Glow Effect for Top 3 */}
              {isTopTrending && (
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500 pointer-events-none blur-xl -z-10
                  ${index === 0 ? 'bg-amber-500/20' :
                    index === 1 ? 'bg-slate-500/20' : 'bg-orange-500/20'}
                `} />
              )}
              
              <div className={`
                relative p-5 rounded-2xl border backdrop-blur-sm 
                transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl
                ${trendRatio >= 0.7
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-rose-900/20 to-orange-900/20 border-rose-800/50' 
                    : 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50'
                    : 'bg-white border-slate-300'
                }
              `}>
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Topic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Premium Rank Badge */}
                      <div className={`
                        relative w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br ${getRankGradient(index)}
                        text-white font-black text-lg shadow-lg
                        transition-transform duration-300 group-hover:scale-110
                      `}>
                        {index + 1}
                        {isTopTrending && (
                          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className={`
                            font-black text-xl truncate capitalize
                            ${textClass}
                          `}>
                            #{topic.keyword}
                          </h4>
                          
                          {/* Dynamic Trend Badges */}
                          {trendRatio >= 0.7 && (
                            <span className={`
                              px-2.5 py-1 text-xs font-black rounded-full border animate-pulse
                              ${getTrendBadge(topic.count, maxCount)}
                            `}>
                              🔥 VIRAL
                            </span>
                          )}
                          {trendRatio >= 0.4 && trendRatio < 0.7 && (
                            <span className={`
                              px-2.5 py-1 text-xs font-bold rounded-full border
                              ${getTrendBadge(topic.count, maxCount)}
                            `}>
                              📈 TRENDING
                            </span>
                          )}
                        </div>

                        {/* Enhanced Stats Row */}
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Zap className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                            <span className={`font-bold ${textClass}`}>
                              {topic.count.toLocaleString()}
                            </span>
                            <span className={mutedText}>
                              mentions
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xl">
                              {getSentimentIcon(topic.sentiment)}
                            </span>
                            <span className={`font-bold capitalize ${getSentimentColor(topic.sentiment)}`}>
                              {topic.sentiment}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-purple-500" />
                            <span className={`font-bold ${textClass}`}>
                              {topic.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Progress Bar with Gradient */}
                    <div className={`relative h-2.5 rounded-full overflow-hidden ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                    }`}>
                      <div 
                        className={`
                          h-full transition-all duration-1000 ease-out
                          ${trendRatio >= 0.7 
                            ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500' 
                            : trendRatio >= 0.4
                              ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }
                        `}
                        style={{ width: `${(trendRatio * 100)}%` }}
                      />
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 2s infinite' }} />
                    </div>
                  </div>

                  {/* Right: Trend Indicator */}
                  <div className="text-right flex-shrink-0">
                    <div className={`
                      flex items-center gap-1 font-black text-2xl
                      ${getTrendColor(topic.count, maxCount)}
                    `}>
                      <TrendingUp className="w-6 h-6" />
                      <span>{Math.round(trendRatio * 100)}%</span>
                    </div>
                    <div className={`text-xs font-medium ${mutedText}`}>
                      of total
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Summary Card */}
      <div className={`
        relative overflow-hidden p-5 rounded-2xl border backdrop-blur-sm 
        transition-all duration-300 hover:scale-105 shadow-lg
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
        }
      `}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-200'}
            `}>
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className={`
                font-bold text-lg
                ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
              `}>
                {trendingCount} topics trending strong
              </div>
              <div className={`
                text-sm
                ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
              `}>
                {data.totalMentions?.toLocaleString() || 0} total mentions analyzed
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className={`
              w-3 h-3 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'}
            `} />
            <div className={`
              w-3 h-3 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}
            `} style={{ animationDelay: '100ms' }} />
            <div className={`
              w-3 h-3 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-pink-400' : 'bg-pink-600'}
            `} style={{ animationDelay: '200ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}