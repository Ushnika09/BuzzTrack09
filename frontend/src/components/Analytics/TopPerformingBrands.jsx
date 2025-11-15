// client/src/components/Analytics/TopPerformingBrands.jsx
import { TrendingUp, Award, ThumbsUp, MessageCircle, Zap, Crown, Star, Users } from 'lucide-react';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';

const sentimentIcons = {
  positive: { 
    icon: ThumbsUp, 
    colorLight: 'text-green-600', 
    colorDark: 'text-green-400',
    bgLight: 'bg-green-100',
    bgDark: 'bg-green-900/30'
  },
  neutral: { 
    icon: MessageCircle, 
    colorLight: 'text-slate-600', 
    colorDark: 'text-slate-400',
    bgLight: 'bg-slate-100',
    bgDark: 'bg-slate-700'
  },
  negative: { 
    icon: ThumbsUp, 
    colorLight: 'text-red-600', 
    colorDark: 'text-red-400',
    bgLight: 'bg-red-100',
    bgDark: 'bg-red-900/30',
    transform: 'rotate-180'
  },
};

const rankConfig = {
  0: {
    bgLight: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    bgDark: 'bg-gradient-to-br from-amber-900/40 to-yellow-900/40',
    textLight: 'text-amber-700',
    textDark: 'text-amber-300',
    borderLight: 'border-amber-200',
    borderDark: 'border-amber-800',
    icon: Crown
  },
  1: {
    bgLight: 'bg-gradient-to-br from-slate-100 to-slate-200',
    bgDark: 'bg-gradient-to-br from-slate-700 to-slate-800',
    textLight: 'text-slate-700',
    textDark: 'text-slate-300',
    borderLight: 'border-slate-300',
    borderDark: 'border-slate-600',
    icon: Star
  },
  2: {
    bgLight: 'bg-gradient-to-br from-orange-100 to-amber-100',
    bgDark: 'bg-gradient-to-br from-orange-900/40 to-amber-900/40',
    textLight: 'text-orange-700',
    textDark: 'text-orange-300',
    borderLight: 'border-orange-200',
    borderDark: 'border-orange-800',
    icon: Award
  },
  default: {
    bgLight: 'bg-gradient-to-br from-slate-50 to-slate-100',
    bgDark: 'bg-gradient-to-br from-slate-800 to-slate-900',
    textLight: 'text-slate-600',
    textDark: 'text-slate-400',
    borderLight: 'border-slate-200',
    borderDark: 'border-slate-700',
    icon: TrendingUp
  }
};

export default function TopPerformingBrands({ brands, isLoading }) {
  const { theme } = useTheme();

  if (isLoading) return <ChartSkeleton />;

  if (!brands || brands.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Brand Data"
        description="Top performing brands will appear here"
        className="h-64"
      />
    );
  }

  // Calculate growth percentage (mock data for demonstration)
  const brandsWithGrowth = brands.map((brand, index) => ({
    ...brand,
    growth: Math.floor(Math.random() * 50) + 10, // Mock growth percentage
    trend: Math.random() > 0.3 ? 'up' : 'down' // Mock trend
  }));

  return (
    <div className={`
      rounded-2xl border shadow-lg transition-all duration-300
      ${theme === 'dark' 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
      }
      p-6 hover:shadow-xl
    `}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-gradient-to-br from-amber-500 to-orange-500
          shadow-lg
        `}>
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`
            text-lg font-semibold
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}>
            Top Performing Brands
          </h3>
          <p className={`
            text-sm
            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
          `}>
            Best performing brands by engagement
          </p>
        </div>
      </div>

      {/* Brands List */}
      <div className="space-y-3">
        {brandsWithGrowth.map((brand, index) => {
          const rank = rankConfig[index] || rankConfig.default;
          const RankIcon = rank.icon;
          const sentimentConfig = sentimentIcons[brand.sentiment] || sentimentIcons.neutral;
          const SentimentIcon = sentimentConfig.icon;

          return (
            <div
              key={brand.brand}
              className={`
                group relative flex items-center gap-4 p-4 rounded-2xl border
                backdrop-blur-sm transition-all duration-300 hover:scale-105
                ${theme === 'light' ? rank.bgLight : rank.bgDark}
                ${theme === 'light' ? rank.borderLight : rank.borderDark}
                hover:shadow-lg
              `}
            >
              {/* Rank Badge */}
              <div className="relative">
                <div className={`
                  w-12 h-12 flex items-center justify-center rounded-xl
                  border-2 font-bold text-lg shadow-lg
                  ${theme === 'light' ? rank.borderLight : rank.borderDark}
                  ${theme === 'light' ? rank.textLight : rank.textDark}
                `}>
                  {index + 1}
                </div>
                <RankIcon className={`
                  absolute -top-1 -right-1 w-5 h-5
                  ${theme === 'light' ? rank.textLight : rank.textDark}
                `} />
              </div>

              {/* Brand Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`
                    font-bold text-lg truncate
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {brand.brand}
                  </h4>
                  {index === 0 && (
                    <span className={`
                      px-2 py-1 text-xs font-bold rounded-full
                      ${theme === 'dark' 
                        ? 'bg-amber-900/50 text-amber-300' 
                        : 'bg-amber-100 text-amber-700'
                      }
                    `}>
                      LEADER
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  {/* Mentions */}
                  <div className="flex items-center gap-1">
                    <MessageCircle className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <span className={`
                      font-medium
                      ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}
                    `}>
                      {brand.mentions?.toLocaleString()}
                    </span>
                    <span className={`
                      ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}
                    `}>
                      mentions
                    </span>
                  </div>

                  {/* Sentiment */}
                  <div className="flex items-center gap-1">
                    <SentimentIcon className={`w-4 h-4 ${sentimentConfig.transform || ''} ${
                      theme === 'dark' ? sentimentConfig.colorDark : sentimentConfig.colorLight
                    }`} />
                    <span className={`
                      font-medium capitalize
                      ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}
                    `}>
                      {brand.sentiment}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="text-right space-y-1">
                {/* Engagement Score */}
                <div className="flex items-center justify-end gap-1">
                  <Zap className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <div className={`
                    text-lg font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {brand.engagement}
                  </div>
                </div>
                <div className={`
                  text-xs font-medium
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  engagement
                </div>

                {/* Growth Indicator */}
                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${
                  brand.trend === 'up' 
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${
                    brand.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {brand.growth}%
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                transition-opacity duration-300 pointer-events-none
                bg-gradient-to-r from-amber-500/10 to-orange-500/10
                -z-10
              `} />
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      {brands.length > 0 && (
        <div className={`
          mt-6 pt-4 border-t
          ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
        `}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {brands.length}
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
              `}>
                Total Brands
              </div>
            </div>
            <div>
              <div className={`
                text-xl font-bold text-green-600 dark:text-green-400
              `}>
                {Math.round(brands.reduce((sum, b) => sum + (b.engagement || 0), 0) / brands.length)}
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
              `}>
                Avg Engagement
              </div>
            </div>
            <div>
              <div className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {brands.reduce((sum, b) => sum + (b.mentions || 0), 0).toLocaleString()}
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
              `}>
                Total Mentions
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}