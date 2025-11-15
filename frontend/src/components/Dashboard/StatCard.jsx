// client/src/components/Dashboard/StatCard.jsx
import { TrendingUp, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import { useBrandStats } from '../../hooks/useBrandStats';
import { useRealtime } from '../../hooks/useRealtime';
import { StatCardSkeleton } from '../UI/Skeleton';
import { useTheme } from '../../context/ThemeContext';

const stats = [
  { 
    key: 'total', 
    label: 'Total Mentions', 
    icon: MessageCircle, 
    gradient: 'from-blue-500 to-cyan-500',
    description: 'All mentions across platforms'
  },
  { 
    key: 'positive', 
    label: 'Positive', 
    icon: ThumbsUp, 
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Positive sentiment mentions'
  },
  { 
    key: 'negative', 
    label: 'Negative', 
    icon: AlertCircle, 
    gradient: 'from-rose-500 to-pink-500',
    description: 'Negative sentiment mentions'
  },
  { 
    key: 'engagement', 
    label: 'Avg Engagement', 
    icon: TrendingUp, 
    gradient: 'from-violet-500 to-purple-500',
    description: 'Average likes, shares & comments'
  },
];

export default function StatCard({ brand }) {
  const { data, isLoading } = useBrandStats(brand);
  const { spike } = useRealtime(brand);
  const { theme } = useTheme();

  // Detect if spike is currently active
  const hasActiveSpike = spike?.detected === true;

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-6 ${hasActiveSpike ? 'scale-95' : 'scale-100'} transition-all duration-500`}>
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const values = {
    total: data?.stats?.total || 0,
    positive: data?.stats?.sentiment?.positive || 0,
    negative: data?.stats?.sentiment?.negative || 0,
    engagement: Math.round(data?.stats?.avgEngagement || 0),
  };

  // Calculate percentages for sentiment
  const positivePercentage = values.total > 0 ? Math.round((values.positive / values.total) * 100) : 0;
  const negativePercentage = values.total > 0 ? Math.round((values.negative / values.total) * 100) : 0;

  // Theme-based classes
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-slate-700/80' : 'border-slate-200/80';
  const textPrimary = theme === 'dark' ? 'text-slate-200' : 'text-slate-700';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const textValue = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div
  className={`
    grid grid-cols-2 gap-6
    transition-all duration-500 ease-out h-full
  `}
>
  {stats.map((stat) => {
    const Icon = stat.icon;
    const value = values[stat.key];
    
    // Add percentage for sentiment cards
    const showPercentage = (stat.key === 'positive' || stat.key === 'negative') && values.total > 0;
    const percentage = stat.key === 'positive' ? positivePercentage : negativePercentage;

    // Dynamic font size based on value length
    const valueLength = value.toString().length;
    const getValueSize = () => {
      if (valueLength <= 4) return 'text-3xl';
      if (valueLength <= 6) return 'text-2xl';
      if (valueLength <= 8) return 'text-xl';
      return 'text-lg';
    };

    return (
      <div
        key={stat.key}
        className={`
          group relative overflow-hidden rounded-2xl h-full min-h-[140px]
          ${cardBg} 
          border ${borderColor}
          shadow-lg hover:shadow-xl 
          transition-all duration-300 hover:-translate-y-1
          backdrop-blur-sm flex flex-col
        `}
      >
        {/* Expanded Gradient Bar - Same color as hover */}
        <div className={`
          absolute top-0 left-0 right-0 bg-gradient-to-r ${stat.gradient} 
          rounded-t-2xl transition-all duration-300
          h-2 group-hover:h-3
        `} />

        <div className="relative z-10 flex flex-col h-full p-4 flex-1">
          {/* Header - Icon and Label - Always Visible */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-semibold tracking-tight text-sm
                ${textPrimary} leading-tight
              `}>
                {stat.label}
              </h3>
              <p className={`text-xs ${textSecondary} mt-1 leading-relaxed`}>
                {stat.description}
              </p>
            </div>
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center 
              bg-gradient-to-br ${stat.gradient} shadow-lg
              flex-shrink-0 ml-3
            `}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Value and Additional Info - Auto-adjusting */}
          <div className="mt-auto space-y-2">
            <div className={`
              font-bold tracking-tight leading-none
              ${getValueSize()}
              ${textValue}
            `}>
              {value.toLocaleString()}
              {stat.key === 'engagement' && (
                <span className={`
                  font-normal ${textSecondary} 
                  ${valueLength <= 6 ? 'text-lg' : 'text-base'}
                `}>%</span>
              )}
            </div>

            {/* Additional Info Row */}
            <div className="flex items-center gap-3">
              {/* Percentage for sentiment cards */}
              {showPercentage && (
                <div className="flex items-center gap-1.5">
                  <div className={`
                    w-2.5 h-2.5 rounded-full
                    ${stat.key === 'positive' 
                      ? 'bg-emerald-500' 
                      : 'bg-rose-500'
                    }
                  `} />
                  <span className={`
                    text-sm font-medium
                    ${stat.key === 'positive'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                    }
                  `}>
                    {percentage}%
                  </span>
                </div>
              )}

              {/* Trend indicator */}
              {stat.key === 'total' && values.total > 0 && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    +12%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Individual Color Hover Effect */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 
          transition-all duration-300 pointer-events-none rounded-2xl
          bg-gradient-to-br ${stat.gradient}
          mix-blend-overlay
        `} />
        
        {/* Subtle glow effect */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 
          transition-opacity duration-300 pointer-events-none
          bg-gradient-to-r ${stat.gradient} blur-md
          -inset-2
        `} />
      </div>
    );
  })}
</div>
  );
}