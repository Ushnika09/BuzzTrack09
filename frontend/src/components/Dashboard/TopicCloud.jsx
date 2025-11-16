// client/src/components/Dashboard/TopicCloud.jsx
import { useQuery } from '@tanstack/react-query';
import { Tag, TrendingUp, TrendingDown, Minus, Sparkles, Zap, BarChart3 } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';

const sentimentColors = {
  positive: {
    light: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400 hover:shadow-emerald-200/50',
    dark: 'bg-emerald-900/40 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60 hover:border-emerald-500 hover:shadow-emerald-500/20',
    glow: 'bg-emerald-500'
  },
  neutral: {
    light: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:border-slate-400 hover:shadow-slate-200/50',
    dark: 'bg-slate-700/40 text-slate-300 border-slate-600 hover:bg-slate-700/60 hover:border-slate-500 hover:shadow-slate-500/20',
    glow: 'bg-slate-500'
  },
  negative: {
    light: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 hover:border-rose-400 hover:shadow-rose-200/50',
    dark: 'bg-rose-900/40 text-rose-300 border-rose-700 hover:bg-rose-900/60 hover:border-rose-500 hover:shadow-rose-500/20',
    glow: 'bg-rose-500'
  },
};

const SentimentIcon = ({ sentiment }) => {
  const icons = {
    positive: TrendingUp,
    neutral: Minus,
    negative: TrendingDown,
  };
  const Icon = icons[sentiment] || Minus;
  
  const iconColors = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    neutral: 'text-slate-600 dark:text-slate-400',
    negative: 'text-rose-600 dark:text-rose-400',
  };

  return <Icon className={`w-3 h-3 ${iconColors[sentiment]}`} />;
};

export default function TopicCloud({ brand, timeframe = '24h', limit = 30 }) {
  const { theme } = useTheme();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-topics', brand, timeframe, limit],
    queryFn: async () => {
      const response = await topicsAPI.getBrandTopics(brand, timeframe, limit);
      return response.data;
    },
    enabled: !!brand,
    refetchInterval: 60000,
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

  // Get sentiment color based on theme
  const getSentimentColor = (sentiment) => {
    return theme === 'dark' ? sentimentColors[sentiment].dark : sentimentColors[sentiment].light;
  };

  const getGlowColor = (sentiment) => {
    return sentimentColors[sentiment].glow;
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-purple-600
            shadow-lg shadow-blue-500/25
          `}>
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${textClass}`}>
              Topic Cloud
            </h3>
            <p className={`text-sm ${mutedText} flex items-center gap-2`}>
              <Sparkles className="w-4 h-4 text-purple-500" />
              Visual distribution of trending topics
            </p>
          </div>
        </div>
        <div className={`px-3 py-2 rounded-xl border ${borderClass} ${cardBg} backdrop-blur-sm`}>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {topics.length} Topics
          </div>
        </div>
      </div>

      {/* Premium Topic Cloud with Enhanced Background */}
      <div className={`
        relative p-8 rounded-2xl border-2 ${borderClass} ${cardBg}
        overflow-hidden backdrop-blur-sm
        shadow-lg hover:shadow-xl transition-all duration-500
      `}>
        {/* Enhanced Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none
          ${theme === 'dark' 
            ? 'from-blue-500/10 via-purple-500/5 to-pink-500/10' 
            : 'from-blue-50/80 via-purple-50/60 to-pink-50/80'
          }`} />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-500 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-pink-500 rounded-full blur-xl animate-pulse delay-500" />
        </div>
        
        {/* Topics */}
        <div className="relative flex flex-wrap gap-3 min-h-[280px] items-center justify-center">
          {topics.map((topic) => (
            <button
              key={topic.keyword}
              className={`
                group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2
                transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:z-10
                backdrop-blur-sm
                ${getSentimentColor(topic.sentiment)}
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
              
              {/* Enhanced Hover Glow Effect */}
              <div className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 
                transition-opacity duration-300 pointer-events-none -z-10
                ${getGlowColor(topic.sentiment)} blur-sm
              `} />

              {/* Border Glow Effect */}
              <div className={`
                absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100
                transition-opacity duration-500 pointer-events-none -z-20
                ${getGlowColor(topic.sentiment)} blur-md
              `} />
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Premium Legend */}
      <div className={`
        flex items-center justify-between p-6 rounded-2xl border-2 ${borderClass} ${cardBg}
        backdrop-blur-sm shadow-lg
      `}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-500/20 animate-pulse" />
            <div>
              <span className={`text-sm font-semibold ${textClass}`}>Positive</span>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {topics.filter(t => t.sentiment === 'positive').length} topics
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-slate-500 rounded-full ring-4 ring-slate-500/20" />
            <div>
              <span className={`text-sm font-semibold ${textClass}`}>Neutral</span>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                {topics.filter(t => t.sentiment === 'neutral').length} topics
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-rose-500 rounded-full ring-4 ring-rose-500/20 animate-pulse" />
            <div>
              <span className={`text-sm font-semibold ${textClass}`}>Negative</span>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                {topics.filter(t => t.sentiment === 'negative').length} topics
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Mentions */}
        <div className="text-right">
          <div className={`text-2xl font-black ${textClass}`}>
            {topics.reduce((sum, topic) => sum + topic.count, 0).toLocaleString()}
          </div>
          <div className={`text-xs ${mutedText} font-medium`}>
            Total Mentions
          </div>
        </div>
      </div>

      {/* Enhanced Top Topics List */}
      <div className={`
        p-6 rounded-2xl border-2 ${borderClass} ${cardBg}
        backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500
      `}>
        <div className="flex items-center justify-between mb-6">
          <h4 className={`text-lg font-bold ${textClass} flex items-center gap-3`}>
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-amber-500 to-orange-500
              shadow-lg
            `}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Top 5 Most Mentioned Topics
          </h4>
          <div className={`px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'} border ${borderClass}`}>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Real-time
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {topics.slice(0, 5).map((topic, index) => (
            <div
              key={topic.keyword}
              className={`
                group flex items-center justify-between p-5 rounded-xl 
                border-2 ${borderClass} transition-all duration-300
                hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm
                ${hoverBg}
              `}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Enhanced Premium Rank Badge */}
                <div className={`
                  relative w-12 h-12 rounded-xl flex items-center justify-center
                  font-black text-white shadow-lg transition-all duration-300 group-hover:scale-110
                  ${index === 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-500 shadow-amber-500/25' :
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/25' :
                    index === 2 ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/25' :
                    'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 shadow-slate-500/25'}
                `}>
                  {index + 1}
                  {index < 3 && (
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`font-bold text-lg ${textClass} capitalize truncate`}>
                      #{topic.keyword}
                    </div>
                    <span className={`
                      px-3 py-1 text-xs font-bold rounded-full capitalize border-2 backdrop-blur-sm
                      ${getSentimentColor(topic.sentiment)}
                    `}>
                      {topic.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-sm ${mutedText} flex items-center gap-1`}>
                      <Zap className="w-4 h-4 text-amber-500" />
                      {topic.percentage}% of total
                    </div>
                    <div className={`text-sm ${mutedText} flex items-center gap-1`}>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      +15% growth
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 ml-4">
                <div className={`text-2xl font-black ${textClass}`}>
                  {topic.count.toLocaleString()}
                </div>
                <div className={`text-sm ${mutedText} font-medium`}>
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