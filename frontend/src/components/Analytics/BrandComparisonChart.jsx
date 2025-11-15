// client/src/components/Analytics/BrandComparisonChart.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { statsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, Users, MessageCircle, Zap, Award } from 'lucide-react';

export default function BrandComparisonChart({ brands, timeframe }) {
  const [metric, setMetric] = useState('mentions');
  const { theme } = useTheme();

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
    engagement: Math.round(stats.avgEngagement || 0),
  }));

  // Sort by selected metric for better visualization
  const sortedChartData = [...chartData].sort((a, b) => b[metric] - a[metric]);

  const metricConfig = {
    mentions: { 
      dataKeys: ['mentions'], 
      colors: theme === 'dark' ? ['#60a5fa', '#3b82f6', '#2563eb'] : ['#93c5fd', '#3b82f6', '#1d4ed8'],
      name: 'Total Mentions',
      icon: MessageCircle
    },
    sentiment: { 
      dataKeys: ['positive', 'neutral', 'negative'],
      colors: theme === 'dark' ? ['#34d399', '#94a3b8', '#f87171'] : ['#10b981', '#6b7280', '#ef4444'],
      name: 'Sentiment Breakdown',
      icon: TrendingUp
    },
    engagement: { 
      dataKeys: ['engagement'],
      colors: theme === 'dark' ? ['#a78bfa', '#8b5cf6', '#7c3aed'] : ['#c4b5fd', '#8b5cf6', '#6d28d9'],
      name: 'Avg Engagement',
      icon: Zap
    },
  };

  const config = metricConfig[metric];
  const Icon = config.icon;

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`
          p-4 rounded-2xl shadow-2xl border backdrop-blur-lg
          ${theme === 'dark' 
            ? 'bg-slate-800 border-slate-600 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
          }
        `}>
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Find top brand for highlighting
  const topBrand = sortedChartData[0];

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-purple-600
            shadow-lg
          `}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`
              text-lg font-semibold
              ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
            `}>
              Brand Comparison
            </h3>
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Performance across tracked brands
            </p>
          </div>
        </div>

        {/* Premium Metric Selector */}
        <div className={`
          flex gap-1 p-1 rounded-2xl backdrop-blur-sm border
          ${theme === 'dark' 
            ? 'bg-slate-700/50 border-slate-600/50' 
            : 'bg-slate-100/50 border-slate-200/50'
          }
        `}>
          {Object.entries(metricConfig).map(([m, { icon: MetricIcon }]) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                transition-all duration-300 capitalize min-w-[7rem] justify-center
                ${metric === m
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }
                hover:scale-105
              `}
            >
              <MetricIcon className="w-4 h-4" />
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} 
              opacity={0.5}
            />
            <XAxis 
              dataKey="brand" 
              tick={{ 
                fontSize: 12,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                radius={[4, 4, 0, 0]}
              >
                {sortedChartData.map((entry, barIndex) => (
                  <Cell 
                    key={`cell-${barIndex}`}
                    fill={config.colors[barIndex % config.colors.length]}
                    opacity={entry.brand === topBrand?.brand ? 1 : 0.8}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Summary Stats */}
      <div className={`
        mt-6 pt-6 border-t
        ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
      `}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-2xl backdrop-blur-sm border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {chartData.length}
              </div>
            </div>
            <div className={`
              text-xs font-medium
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Total Brands
            </div>
          </div>
          
          <div className="text-center p-4 rounded-2xl backdrop-blur-sm border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              <div className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {chartData.reduce((sum, b) => sum + b.mentions, 0).toLocaleString()}
              </div>
            </div>
            <div className={`
              text-xs font-medium
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Total Mentions
            </div>
          </div>
          
          <div className="text-center p-4 rounded-2xl backdrop-blur-sm border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <div className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {(chartData.reduce((sum, b) => sum + b.engagement, 0) / chartData.length).toFixed(1)}
              </div>
            </div>
            <div className={`
              text-xs font-medium
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Avg Engagement
            </div>
          </div>
          
          <div className="text-center p-4 rounded-2xl backdrop-blur-sm border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {topBrand?.brand}
              </div>
            </div>
            <div className={`
              text-xs font-medium
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Top Brand
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}