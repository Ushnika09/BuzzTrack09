// client/src/components/Analytics/SourceComparisonChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

export default function SourceComparisonChart({ data, isLoading, timeframe }) {
  if (isLoading) return <ChartSkeleton />;

  if (!data) {
    return (
      <EmptyState
        type="noData"
        title="No Source Data"
        description="Source comparison will appear here"
        className="h-96"
      />
    );
  }

  const chartData = [
    {
      name: 'Reddit',
      mentions: data.reddit?.totalMentions || 0,
      avgSentiment: data.reddit?.avgSentiment || 0,
      avgEngagement: data.reddit?.avgEngagement || 0,
    },
    {
      name: 'News',
      mentions: data.news?.totalMentions || 0,
      avgSentiment: data.news?.avgSentiment || 0,
      avgEngagement: data.news?.avgEngagement || 0,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Source Performance Comparison
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Comparing mentions, sentiment, and engagement across sources
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(data).map(([source, stats]) => (
          <div
            key={source}
            className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {source === 'reddit' ? '👾' : '📰'}
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-white capitalize">
                {source}
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mentions
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.totalMentions}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Sentiment
                </div>
                <div className={`text-lg font-bold ${
                  stats.avgSentiment > 0 ? 'text-green-600' :
                  stats.avgSentiment < 0 ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {stats.avgSentiment.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Engagement
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.avgEngagement.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Top Brands */}
            {stats.topBrands && stats.topBrands.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Top Brands:
                </div>
                <div className="flex flex-wrap gap-1">
                  {stats.topBrands.map((brand) => (
                    <span
                      key={brand}
                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="mentions" fill="#3b82f6" name="Total Mentions" />
            <Bar dataKey="avgEngagement" fill="#10b981" name="Avg Engagement" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}