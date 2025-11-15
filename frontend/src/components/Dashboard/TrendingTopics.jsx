// client/src/components/Dashboard/TrendingTopics.jsx
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, ArrowUp } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

export default function TrendingTopics({ brand, limit = 8 }) {
  const { data, isLoading } = useQuery({
    queryKey: ['trending-topics', brand, limit],
    queryFn: () => topicsAPI.getTrending(brand, limit).then(res => res.data),
    enabled: !!brand,
    refetchInterval: 30000, // Refresh every 30s for trending
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
    if (ratio >= 5) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    if (ratio >= 2) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  };

  return (
    <div id="trending-topics" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          🔥 Trending Now
        </h3>
      </div>

      <div className="space-y-3">
        {trending.map((topic, index) => (
          <div
            key={topic.keyword}
            className="relative group"
          >
            {/* Trending Indicator */}
            {topic.isTrending && index === 0 && (
              <div className="absolute -left-2 -top-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
            
            <div className={`
              p-4 rounded-lg border-2 transition-all
              ${topic.isTrending 
                ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
              }
              hover:shadow-md hover:scale-105
            `}>
              <div className="flex items-start justify-between gap-3">
                {/* Left: Topic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-600">
                      #{index + 1}
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize truncate">
                      {topic.keyword}
                    </h4>
                    {topic.isTrending && (
                      <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-full
                        ${getTrendBadge(topic.trendRatio)}
                      `}>
                        HOT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span>{topic.recentCount} recent mentions</span>
                    <span>•</span>
                    <span className="capitalize">{topic.sentiment}</span>
                  </div>
                </div>

                {/* Right: Trend Indicator */}
                <div className="text-right flex-shrink-0">
                  <div className={`flex items-center gap-1 font-bold ${getTrendColor(topic.trendRatio)}`}>
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-lg">{topic.trendRatio}x</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    vs previous
                  </div>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="mt-3 flex gap-1">
                <div 
                  className="h-1.5 bg-green-500 rounded-full transition-all"
                  style={{ 
                    width: `${(topic.sentimentBreakdown.positive / topic.count * 100)}%` 
                  }}
                  title={`${topic.sentimentBreakdown.positive} positive`}
                />
                <div 
                  className="h-1.5 bg-slate-400 rounded-full transition-all"
                  style={{ 
                    width: `${(topic.sentimentBreakdown.neutral / topic.count * 100)}%` 
                  }}
                  title={`${topic.sentimentBreakdown.neutral} neutral`}
                />
                <div 
                  className="h-1.5 bg-red-500 rounded-full transition-all"
                  style={{ 
                    width: `${(topic.sentimentBreakdown.negative / topic.count * 100)}%` 
                  }}
                  title={`${topic.sentimentBreakdown.negative} negative`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {trending.filter(t => t.isTrending).length} topics are trending up
          </span>
        </div>
      </div>
    </div>
  );
}