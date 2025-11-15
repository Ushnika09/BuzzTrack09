// client/src/components/Analytics/TopPerformingBrands.jsx
import { TrendingUp, Award, ThumbsUp, MessageCircle } from 'lucide-react';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

const sentimentIcons = {
  positive: { icon: ThumbsUp, color: 'text-green-600 dark:text-green-400' },
  neutral: { icon: MessageCircle, color: 'text-slate-600 dark:text-slate-400' },
  negative: { icon: ThumbsUp, color: 'text-red-600 dark:text-red-400 rotate-180' },
};

export default function TopPerformingBrands({ brands, isLoading }) {
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Top Performing Brands
        </h3>
      </div>

      <div className="space-y-4">
        {brands.map((brand, index) => {
          const SentimentIcon = sentimentIcons[brand.sentiment]?.icon || MessageCircle;
          const sentimentColor = sentimentIcons[brand.sentiment]?.color || 'text-slate-600';
          
          return (
            <div
              key={brand.brand}
              className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {/* Rank Badge */}
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                ${index === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : ''}
                ${index === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : ''}
                ${index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : ''}
                ${index > 2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : ''}
              `}>
                {index + 1}
              </div>

              {/* Brand Name */}
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {brand.brand}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{brand.mentions} mentions</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <SentimentIcon className={`w-3 h-3 ${sentimentColor}`} />
                    {brand.sentiment}
                  </span>
                </div>
              </div>

              {/* Engagement */}
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {brand.engagement}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  avg engagement
                </div>
              </div>

              {/* Trend Icon */}
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          );
        })}
      </div>
    </div>
  );
}