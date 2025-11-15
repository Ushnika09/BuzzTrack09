// client/src/components/Analytics/SentimentTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { mentionsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

export default function SentimentTrendChart({ brands, timeframe }) {
  // Fetch all mentions for sentiment analysis
  const { data, isLoading } = useQuery({
    queryKey: ['sentiment-trend', brands, timeframe],
    queryFn: async () => {
      const results = await Promise.all(
        brands.map(brand =>
          mentionsAPI.getAll({ brand, limit: 1000 })
            .then(res => ({ brand, mentions: res.data.mentions }))
            .catch(() => ({ brand, mentions: [] }))
        )
      );
      return results;
    },
    enabled: brands.length > 0,
  });

  if (isLoading) return <ChartSkeleton />;

  if (!data || data.every(d => d.mentions.length === 0)) {
    return (
      <EmptyState
        type="noData"
        title="No Sentiment Data"
        description="Sentiment trends will appear here once mentions are collected"
        className="h-96"
      />
    );
  }

  // Group mentions by time and calculate sentiment scores
  const groupByHour = (mentions) => {
    const groups = {};
    mentions.forEach(m => {
      const hour = new Date(m.timestamp).setMinutes(0, 0, 0);
      const key = new Date(hour).toISOString();
      if (!groups[key]) {
        groups[key] = { positive: 0, neutral: 0, negative: 0, total: 0 };
      }
      groups[key][m.sentiment]++;
      groups[key].total++;
    });
    return groups;
  };

  // Create chart data
  const allTimestamps = new Set();
  const brandData = {};

  data.forEach(({ brand, mentions }) => {
    const grouped = groupByHour(mentions);
    brandData[brand] = grouped;
    Object.keys(grouped).forEach(ts => allTimestamps.add(ts));
  });

  const chartData = Array.from(allTimestamps)
    .sort()
    .slice(-24) // Last 24 hours
    .map(timestamp => {
      const point = {
        time: new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };

      brands.forEach(brand => {
        const data = brandData[brand]?.[timestamp];
        if (data && data.total > 0) {
          // Calculate positive sentiment percentage
          point[brand] = ((data.positive / data.total) * 100).toFixed(1);
        } else {
          point[brand] = 0;
        }
      });

      return point;
    });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Sentiment Trend Over Time
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Percentage of positive mentions per hour for each brand
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              label={{ value: 'Positive %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              formatter={(value) => `${value}%`}
            />
            <Legend />
            {brands.map((brand, index) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
            Most Positive
          </div>
          <div className="text-lg font-bold text-green-900 dark:text-green-100">
            {brands[0] || 'N/A'}
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
            Most Active
          </div>
          <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {data.reduce((max, d) => d.mentions.length > max.mentions.length ? d : max).brand}
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">
            Total Data Points
          </div>
          <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {chartData.length}
          </div>
        </div>
      </div>
    </div>
  );
}