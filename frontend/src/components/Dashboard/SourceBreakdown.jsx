import { useBrandStats } from '../../hooks/useBrandStats';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, MessageCircle, Users } from 'lucide-react';

// Theme-aware colors
const sourceColorsLight = {
  reddit: '#ff4500',
  news: '#3b82f6',
  twitter: '#1da1f2',
  facebook: '#1877f2',
  instagram: '#e4405f',
  youtube: '#ff0000'
};

const sourceColorsDark = {
  reddit: '#ff6b35',
  news: '#60a5fa',
  twitter: '#38bdf8',
  facebook: '#4a90e2',
  instagram: '#fd5c7e',
  youtube: '#ff3333'
};

const sourceIcons = {
  reddit: '👾',
  news: '📰',
};

const sourceLabels = {
  reddit: 'Reddit',
  news: 'News',
};

// Always show all sources, even if count is 0
const ALL_SOURCES = ['reddit', 'news'];

export default function SourceBreakdown({ brand, timeframe = '7d' }) {
  const { data, isLoading } = useBrandStats(brand, timeframe);
  const { theme } = useTheme();

  // Get colors based on theme
  const sourceColors = theme === 'dark' ? sourceColorsDark : sourceColorsLight;

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
      percentage: parseFloat(percentage),
      label: sourceLabels[source] || source,
      hasData: count > 0,
      color: sourceColors[source] || '#6b7280'
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

  // Find top source for highlighting
  const topSource = sourceData.find(item => item.hasData);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`
            text-lg font-semibold
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}>
            Source Breakdown
          </h3>
          <p className={`
            text-sm mt-1
            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
          `}>
            Distribution across platforms
          </p>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${theme === 'dark' 
            ? 'bg-slate-700 text-slate-300' 
            : 'bg-slate-100 text-slate-700'
          }
        `}>
          {totalMentions} total
        </div>
      </div>
      
      {/* Source List */}
      <div className="space-y-4">
        {sourceData.map(({ source, count, percentage, label, hasData, color }) => (
          <div 
            key={source}
            className={`
              group flex items-center justify-between p-3 rounded-xl
              transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'hover:bg-slate-700/50' 
                : 'hover:bg-slate-50'
              }
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Platform Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                text-lg shadow-lg
                ${hasData 
                  ? 'text-white' 
                  : theme === 'dark' 
                    ? 'text-slate-500 bg-slate-700' 
                    : 'text-slate-400 bg-slate-100'
                }
              `} style={{ 
                backgroundColor: hasData ? color : 'transparent',
                opacity: hasData ? 1 : 0.6
              }}>
                {sourceIcons[source] || '📊'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    font-semibold text-sm
                    ${hasData 
                      ? theme === 'dark' ? 'text-white' : 'text-slate-900'
                      : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }
                  `}>
                    {label}
                  </span>
                  {source === topSource?.source && hasData && (
                    <span className={`
                      px-2 py-0.5 text-xs font-bold rounded-full
                      ${theme === 'dark' 
                        ? 'bg-amber-900/30 text-amber-300' 
                        : 'bg-amber-100 text-amber-700'
                      }
                    `}>
                      Top
                    </span>
                  )}
                </div>
                <p className={`
                  text-sm
                  ${hasData 
                    ? theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    : theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                  }
                `}>
                  {hasData ? `${count} mentions` : 'No data yet'}
                </p>
              </div>
            </div>
            
            {/* Percentage and Progress Bar */}
            <div className="text-right w-24">
              <div className={`
                font-bold text-lg mb-2
                ${hasData 
                  ? theme === 'dark' ? 'text-white' : 'text-slate-900'
                  : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }
              `}>
                {percentage}%
              </div>
              <div className={`
                w-full h-2 rounded-full overflow-hidden
                ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}
              `}>
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: hasData ? color : (theme === 'dark' ? '#475569' : '#d1d5db'),
                    opacity: hasData ? 1 : 0.5
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {hasAnyData && (
        <div className={`
          mt-6 pt-4 border-t
          ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
        `}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {sourceData.filter(item => item.hasData).length}
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
              `}>
                Active Sources
              </div>
            </div>
            <div>
              <div className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {topSource?.percentage || 0}%
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
              `}>
                Top Source
              </div>
            </div>
            <div>
              <div className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}
              `}>
                {Math.round(sourceData.reduce((acc, item) => acc + item.percentage, 0))}%
              </div>
              <div className={`
                text-xs
                ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
              `}>
                Coverage
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`
          mt-4 p-3 rounded-lg
          ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}
        `}>
          <p className={`
            text-xs
            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
          `}>
            <strong>Debug:</strong> Sources data: {JSON.stringify(sources)}
          </p>
        </div>
      )}
    </div>
  );
}