// client/src/components/Dashboard/TopicCloud.jsx
import { useQuery } from '@tanstack/react-query';
import { Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

const sentimentColors = {
  positive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  neutral: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
  negative: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const SentimentIcon = ({ sentiment }) => {
  const icons = {
    positive: TrendingUp,
    neutral: Minus,
    negative: TrendingDown,
  };
  const Icon = icons[sentiment] || Minus;
  return <Icon className="w-3 h-3" />;
};

export default function TopicCloud({ brand, timeframe = '24h', limit = 25 }) {
  const { data, isLoading } = useQuery({
    queryKey: ['topics', brand, timeframe, limit],
    queryFn: () => topicsAPI.getTopics(brand, timeframe, limit).then(res => res.data),
    enabled: !!brand,
    refetchInterval: 60000,
  });

  if (isLoading) return <ChartSkeleton />;

  if (!data || !data.topics || data.topics.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Topics Found"
        description="Topics will appear here once mentions are collected and analyzed"
        className="h-64"
      />
    );
  }

  const topics = data.topics;
  const maxCount = Math.max(...topics.map(t => t.count));

  // Calculate font size based on count
  const getFontSize = (count) => {
    const ratio = count / maxCount;
    const minSize = 0.75; // rem
    const maxSize = 2.5; // rem
    return minSize + (ratio * (maxSize - minSize));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Topic Cloud
          </h3>
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {data.totalMentions} mentions analyzed
        </span>
      </div>

      {/* Topic Cloud */}
      <div className="flex flex-wrap gap-3 mb-6 min-h-[200px] items-center justify-center p-4">
        {topics.map((topic) => (
          <button
            key={topic.keyword}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full border-2
              transition-all duration-200 hover:scale-110 hover:shadow-lg
              ${sentimentColors[topic.sentiment]}
            `}
            style={{ 
              fontSize: `${getFontSize(topic.count)}rem`,
              fontWeight: 600,
            }}
            title={`${topic.count} mentions • ${topic.sentiment} sentiment`}
          >
            <SentimentIcon sentiment={topic.sentiment} />
            {topic.keyword}
            <span className="text-xs opacity-75">
              {topic.count}
            </span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded" />
          <span className="text-slate-600 dark:text-slate-400">Positive</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded" />
          <span className="text-slate-600 dark:text-slate-400">Neutral</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded" />
          <span className="text-slate-600 dark:text-slate-400">Negative</span>
        </div>
      </div>

      {/* Top Topics List */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Top 5 Topics
        </h4>
        {topics.slice(0, 5).map((topic, index) => (
          <div
            key={topic.keyword}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-400 dark:text-slate-600">
                #{index + 1}
              </span>
              <div>
                <div className="font-medium text-slate-900 dark:text-white capitalize">
                  {topic.keyword}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {topic.percentage}% of mentions • {topic.sentiment}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900 dark:text-white">
                {topic.count}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                mentions
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}