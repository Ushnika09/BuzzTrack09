// client/src/components/Dashboard/TrendingTopics.jsx
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, ArrowUp, Zap, Sparkles, Target, Clock, BarChart3, Crown } from 'lucide-react';
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

  // Theme classes
  const cardBg = theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90';
  const borderClass = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/60';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/80';

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
    if (ratio >= 0.7) return {
      bg: 'bg-gradient-to-r from-rose-500 to-orange-500',
      text: 'text-white',
      shadow: 'shadow-rose-500/25'
    };
    if (ratio >= 0.4) return {
      bg: 'bg-gradient-to-r from-orange-500 to-amber-500',
      text: 'text-white',
      shadow: 'shadow-orange-500/25'
    };
    return {
      bg: theme === 'dark' ? 'bg-yellow-900/40' : 'bg-yellow-100',
      text: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700',
      shadow: 'shadow-yellow-500/10'
    };
  };

  const getRankGradient = (index) => {
    if (index === 0) return 'from-amber-500 to-yellow-500 shadow-amber-500/30';
    if (index === 1) return 'from-slate-400 to-slate-500 shadow-slate-500/30';
    if (index === 2) return 'from-orange-500 to-amber-500 shadow-orange-500/30';
    return theme === 'dark' 
      ? 'from-slate-600 to-slate-500 shadow-slate-500/20' 
      : 'from-slate-300 to-slate-400 shadow-slate-400/20';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600';
      case 'negative': return theme === 'dark' ? 'text-rose-400' : 'text-rose-600';
      default: return theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
    }
  };

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive': return theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-100';
      case 'negative': return theme === 'dark' ? 'bg-rose-900/30' : 'bg-rose-100';
      default: return theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100';
    }
  };

  const maxCount = Math.max(...topics.map(t => t.count));
  const trendingCount = topics.filter(t => t.count >= maxCount * 0.3).length;

  return (
    <div className="space-y-6">
      {/* Premium Header with Real-Time Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`
            relative w-14 h-14 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-500/25
            transition-all duration-500 hover:scale-105
          `}>
            <Flame className="w-7 h-7 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h3 className={`text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
              Trending Now
            </h3>
            <p className={`text-sm ${mutedText} flex items-center gap-2 mt-1`}>
              <Sparkles className="w-4 h-4 text-orange-500" />
              Live insights • {topics.length} active topics
            </p>
          </div>
        </div>

        {/* Enhanced Trending Counter Badge */}
        <div className={`
          relative px-5 py-3 rounded-2xl font-black text-sm backdrop-blur-sm border-2 shadow-2xl
          transition-all duration-300 hover:scale-105
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-rose-900/40 to-orange-900/40 border-rose-700/50 text-rose-300' 
            : 'bg-gradient-to-r from-rose-100 to-orange-100 border-rose-300 text-rose-700'
          }
        `}>
          🔥 {trendingCount} Hot Topics
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((topic, index) => {
          const isTopTrending = index < 3;
          const trendRatio = topic.count / maxCount;
          const trendBadge = getTrendBadge(topic.count, maxCount);

          return (
            <div
              key={topic.keyword}
              className="group relative"
            >
              {/* Premium Glow Effect for Top 3 */}
              {isTopTrending && (
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500 pointer-events-none blur-2xl -z-10
                  ${index === 0 ? 'bg-amber-500/20' :
                    index === 1 ? 'bg-slate-500/20' : 'bg-orange-500/20'}
                `} />
              )}
              
              <div className={`
                relative p-6 rounded-2xl border-2 backdrop-blur-sm 
                transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl
                ${trendRatio >= 0.7
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-rose-900/20 to-orange-900/20 border-rose-700/60' 
                    : 'bg-gradient-to-r from-rose-50/80 to-orange-50/80 border-rose-300/60'
                  : theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : 'bg-white/80 border-slate-200/60'
                }
              `}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 rounded-2xl opacity-5">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500 rounded-full animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-red-500 rounded-full animate-pulse delay-500" />
                </div>

                <div className="flex items-start justify-between gap-6">
                  {/* Left: Topic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Ultra-Premium Rank Badge */}
                      <div className={`
                        relative w-12 h-12 rounded-2xl flex items-center justify-center
                        bg-gradient-to-br ${getRankGradient(index)}
                        text-white font-black text-xl shadow-2xl
                        transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                      `}>
                        {index + 1}
                        {isTopTrending && (
                          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h4 className={`
                            font-black text-2xl truncate capitalize
                            ${textClass}
                          `}>
                            #{topic.keyword}
                          </h4>
                          
                          {/* Dynamic Trend Badges */}
                          {trendRatio >= 0.7 && (
                            <span className={`
                              px-3 py-1.5 text-xs font-black rounded-full border-2 shadow-lg
                              ${trendBadge.bg} ${trendBadge.text} ${trendBadge.shadow}
                              animate-pulse
                            `}>
                              🔥 VIRAL
                            </span>
                          )}
                          {trendRatio >= 0.4 && trendRatio < 0.7 && (
                            <span className={`
                              px-3 py-1.5 text-xs font-black rounded-full border-2 shadow-lg
                              ${trendBadge.bg} ${trendBadge.text} ${trendBadge.shadow}
                            `}>
                              📈 TRENDING
                            </span>
                          )}
                        </div>

                        {/* Enhanced Stats Row */}
                        <div className="flex items-center gap-6 text-sm flex-wrap">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${getSentimentBg(topic.sentiment)}`}>
                            <span className="text-lg">
                              {topic.sentiment === 'positive' ? '😊' : topic.sentiment === 'negative' ? '😞' : '😐'}
                            </span>
                            <span className={`font-bold capitalize ${getSentimentColor(topic.sentiment)}`}>
                              {topic.sentiment}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
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

                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className={`font-bold ${textClass}`}>
                              {topic.percentage}%
                            </span>
                            <span className={mutedText}>
                              of total
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Progress Bar with Gradient */}
                    <div className={`relative h-3 rounded-full overflow-hidden ${
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
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* Right: Trend Indicator */}
                  <div className="text-right flex-shrink-0">
                    <div className={`
                      flex items-center gap-2 font-black text-3xl mb-2
                      ${getTrendColor(topic.count, maxCount)}
                    `}>
                      <TrendingUp className="w-8 h-8 animate-bounce" />
                      <span>{Math.round(trendRatio * 100)}%</span>
                    </div>
                    <div className={`text-sm font-semibold ${mutedText}`}>
                      engagement rate
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
        relative overflow-hidden p-6 rounded-2xl border-2 backdrop-blur-sm 
        transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50' 
          : 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-blue-300/60'
        }
      `}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl
            `}>
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className={`
                font-black text-xl
                ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
              `}>
                {trendingCount} topics trending strong
              </div>
              <div className={`
                text-sm font-semibold
                ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
              `}>
                {data.totalMentions?.toLocaleString() || 0} total mentions analyzed in real-time
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={`
              w-4 h-4 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'}
            `} />
            <div className={`
              w-4 h-4 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}
            `} style={{ animationDelay: '200ms' }} />
            <div className={`
              w-4 h-4 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-pink-400' : 'bg-pink-600'}
            `} style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}