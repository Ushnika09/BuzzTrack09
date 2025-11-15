// client/src/components/Analytics/BrandComparisonChart.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

export default function BrandComparisonChart({ brands, timeframe }) {
  const [metric, setMetric] = useState('mentions');

  // Fetch stats for all brands
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['brand-stats-all', brands, timeframe],
    queryFn: async () => {
      const results = await Promise.all(
        brands.map(brand => 
          statsAPI.getBrandStats(brand, timeframe)
            .then(res => ({ brand, stats: res.data.stats }))
            .catch(() => ({ brand, stats: null }))
        )
      );
      return results.filter(r => r.stats);
    },
    enabled: brands.length > 0,
  });

  if (isLoading) return <ChartSkeleton />;

  if (!statsData || statsData.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Brand Data"
        description="Brand comparison will appear here"
        className="h-96"
      />
    );
  }

  const chartData = statsData.map(({ brand, stats }) => ({
    brand,
    mentions: stats.total || 0,
    positive: stats.sentiment?.positive || 0,
    neutral: stats.sentiment?.neutral || 0,
    negative: stats.sentiment?.negative || 0,
    engagement: stats.avgEngagement || 0,
  }));

  const metricConfig = {
    mentions: { 
      dataKeys: ['mentions'], 
      colors: ['#3b82f6'],
      name: 'Total Mentions'
    },
    sentiment: { 
      dataKeys: ['positive', 'neutral', 'negative'],
      colors: ['#10b981', '#94a3b8', '#ef4444'],
      name: 'Sentiment Breakdown'
    },
    engagement: { 
      dataKeys: ['engagement'],
      colors: ['#8b5cf6'],
      name: 'Avg Engagement'
    },
  };

  const config = metricConfig[metric];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Brand Comparison
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compare performance across all tracked brands
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          {Object.keys(metricConfig).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize
                ${metric === m
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="brand" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {config.dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={config.colors[index]}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Total Brands
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {chartData.length}
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Total Mentions
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {chartData.reduce((sum, b) => sum + b.mentions, 0)}
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Avg Engagement
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {(chartData.reduce((sum, b) => sum + b.engagement, 0) / chartData.length).toFixed(1)}
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Positive %
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {((chartData.reduce((sum, b) => sum + b.positive, 0) / 
               chartData.reduce((sum, b) => sum + b.mentions, 0) || 0) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}