import { useBrandStats } from '../../hooks/useBrandStats';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

const sourceColors = {
  reddit: '#ff4500',
  news: '#3b82f6',
  twitter: '#1da1f2'
};

const sourceIcons = {
  reddit: '👾',
  news: '📰',
  twitter: '🐦'
};

const sourceLabels = {
  reddit: 'Reddit',
  news: 'News',
  twitter: 'Twitter'
};

// Always show all sources, even if count is 0
const ALL_SOURCES = ['reddit', 'news', 'twitter'];

export default function SourceBreakdown({ brand, timeframe = '7d' }) {
  const { data, isLoading } = useBrandStats(brand, timeframe);

  if (isLoading) return <ChartSkeleton />;

  const stats = data?.stats;
  
  // If no stats or sources, show all sources with 0 counts
  const sources = stats?.sources || {};
  const totalMentions = stats?.total || 0;

  // Create data for ALL sources, including those with 0 mentions
  const sourceData = ALL_SOURCES.map(source => {
    const count = sources[source] || 0;
    const percentage = totalMentions > 0 ? (count / totalMentions * 100).toFixed(1) : 0;
    
    return {
      source,
      count,
      percentage,
      label: sourceLabels[source] || source,
      hasData: count > 0
    };
  }).sort((a, b) => b.count - a.count); // Sort by count descending

  // Check if we have ANY data at all
  const hasAnyData = sourceData.some(item => item.hasData);

  if (!hasAnyData) {
    return (
      <EmptyState
        type="noData"
        title="No Source Data"
        description="Mention data will appear here once mentions are collected from all sources."
        className="h-64"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Source Breakdown
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Total: {totalMentions} mentions
        </span>
      </div>
      
      <div className="space-y-4">
        {sourceData.map(({ source, count, percentage, label, hasData }) => (
          <div key={source} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sourceIcons[source] || '📊'}</span>
              <div>
                <span className={`font-medium capitalize ${
                  hasData ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {label}
                </span>
                <p className={`text-sm ${
                  hasData ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {hasData ? `${count} mentions` : 'No data yet'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-semibold ${
                hasData ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {percentage}%
              </div>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: hasData ? sourceColors[source] : '#d1d5db',
                    opacity: hasData ? 1 : 0.5
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong>Debug:</strong> Sources data: {JSON.stringify(sources)}
          </p>
        </div>
      )}
    </div>
  );
}