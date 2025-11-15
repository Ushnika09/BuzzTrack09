// client/src/components/Dashboard/SentimentChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useBrandStats } from '../../hooks/useBrandStats';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useMemo } from 'react';

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444', 
  neutral: '#6b7280'
};

export default function SentimentChart({ brand, timeframe = '7d' }) {
  const { data, isLoading } = useBrandStats(brand, timeframe);

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!data?.stats?.sentiment) return [];
    
    return Object.entries(data.stats.sentiment)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: COLORS[name]
      }))
      .filter(item => item.value > 0);
  }, [data]);

  if (isLoading) return <ChartSkeleton />;

  if (!data?.stats || chartData.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Sentiment Data"
        description="Sentiment data will appear here once mentions are collected."
        className="h-64"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Sentiment Distribution
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}