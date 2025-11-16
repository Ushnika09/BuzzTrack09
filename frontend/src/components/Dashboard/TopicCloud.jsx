// client/src/components/Dashboard/TopicCloud.jsx
import { useQuery } from '@tanstack/react-query';
import { Tag, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';

const sentimentColors = {
  positive: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
  neutral: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
  negative: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-900/50',
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

export default function TopicCloud({ brand, timeframe = '24h', limit = 30 }) {
  const { theme } = useTheme();
  
  // Use getBrandTopics which maps to /topics/brand/:brand
  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-topics', brand, timeframe, limit],
    queryFn: async () => {
      const response = await topicsAPI.getBrandTopics(brand, timeframe, limit);
      return response.data;
    },
    enabled: !!brand,
    refetchInterval: 60000,
  });

  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';

  if (isLoading) return <ChartSkeleton className="h-96" />;

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to Load Topics"
        description={error.message || "Unable to fetch topics. Please try again later."}
        className="h-96"
      />
    );
  }

  if (!data || !data.topics || data.topics.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Topics Found"
        description="Topics will appear here once mentions are collected and analyzed"
        icon={<Sparkles className="w-16 h-16 text-purple-500" />}
        className="h-96"
      />
    );
  }

  const topics = data.topics;
  const maxCount = Math.max(...topics.map(t => t.count));

  // Calculate font size based on count (premium scaling)
  const getFontSize = (count) => {
    const ratio = count / maxCount;
    const minSize = 0.875; // rem
    const maxSize = 2.75; // rem
    return minSize + (ratio * (maxSize - minSize));
  };

  // Calculate opacity based on count
  const getOpacity = (count) => {
    const ratio = count / maxCount;
    return 0.6 + (ratio * 0.4); // 0.6 to 1.0
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      

      {/* Premium Topic Cloud with Gradient Background */}
      <div className={`
        relative p-8 rounded-2xl border ${borderClass} ${cardBg}
        overflow-hidden
      `}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        
        {/* Topics */}
        <div className="relative flex flex-wrap gap-3 min-h-[280px] items-center justify-center">
          {topics.map((topic) => (
            <button
              key={topic.keyword}
              className={`
                group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2
                transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:z-10
                ${sentimentColors[topic.sentiment]}
              `}
              style={{ 
                fontSize: `${getFontSize(topic.count)}rem`,
                fontWeight: 700,
                opacity: getOpacity(topic.count),
              }}
              title={`${topic.count} mentions • ${topic.sentiment} sentiment • ${topic.percentage}% of total`}
            >
              <SentimentIcon sentiment={topic.sentiment} />
              <span className="capitalize">{topic.keyword}</span>
              <span className="text-xs opacity-75 font-bold">
                {topic.count}
              </span>
              
              {/* Hover Glow Effect */}
              <div className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 
                transition-opacity duration-300 pointer-events-none -z-10
                ${topic.sentiment === 'positive' ? 'bg-emerald-500' :
                  topic.sentiment === 'negative' ? 'bg-rose-500' : 'bg-slate-500'}
              `} />
            </button>
          ))}
        </div>
      </div>

      {/* Premium Legend */}
      <div className={`
        flex items-center justify-center gap-8 p-4 rounded-xl border ${borderClass} ${cardBg}
      `}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-500/20" />
          <span className={`text-sm font-medium ${mutedText}`}>Positive</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            {topics.filter(t => t.sentiment === 'positive').length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-500 rounded-full ring-4 ring-slate-500/20" />
          <span className={`text-sm font-medium ${mutedText}`}>Neutral</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
            {topics.filter(t => t.sentiment === 'neutral').length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full ring-4 ring-rose-500/20" />
          <span className={`text-sm font-medium ${mutedText}`}>Negative</span>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
            {topics.filter(t => t.sentiment === 'negative').length}
          </span>
        </div>
      </div>

      {/* Top Topics List - Premium Design */}
      <div className={`p-6 rounded-2xl border ${borderClass} ${cardBg}`}>
        <h4 className={`text-sm font-bold ${textClass} mb-4 flex items-center gap-2`}>
          <Sparkles className="w-4 h-4 text-purple-500" />
          Top 5 Most Mentioned Topics
        </h4>
        <div className="space-y-3">
          {topics.slice(0, 5).map((topic, index) => (
            <div
              key={topic.keyword}
              className={`
                group flex items-center justify-between p-4 rounded-xl 
                border ${borderClass} transition-all duration-300
                hover:scale-105 hover:shadow-lg
                ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-50'}
              `}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Premium Rank Badge */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  font-black text-white shadow-lg
                  ${index === 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                    'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500'}
                `}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`font-bold ${textClass} capitalize truncate`}>
                      {topic.keyword}
                    </div>
                    <span className={`
                      px-2 py-0.5 text-xs font-bold rounded-full capitalize
                      ${sentimentColors[topic.sentiment]}
                    `}>
                      {topic.sentiment}
                    </span>
                  </div>
                  <div className={`text-xs ${mutedText}`}>
                    {topic.percentage}% of all mentions
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-black ${textClass}`}>
                  {topic.count.toLocaleString()}
                </div>
                <div className={`text-xs ${mutedText}`}>
                  mentions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}