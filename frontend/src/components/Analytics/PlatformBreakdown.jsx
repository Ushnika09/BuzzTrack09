// client/src/components/Analytics/PlatformBreakdown.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

const COLORS = {
  reddit: '#ff4500',
  news: '#3b82f6',
  twitter: '#1da1f2',
};

const ICONS = {
  reddit: '👾',
  news: '📰',
  twitter: '🐦',
};

export default function PlatformBreakdown({ data, isLoading }) {
  if (isLoading) return <ChartSkeleton />;

  if (!data || Object.values(data).every(v => v === 0)) {
    return (
      <EmptyState
        type="noData"
        title="No Platform Data"
        description="Platform breakdown will appear here once data is collected"
        className="h-64"
      />
    );
  }

  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      icon: ICONS[name],
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Platform Breakdown
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name.toLowerCase()]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} mentions`, 'Count']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.value}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}