// client/src/components/Dashboard/SentimentChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useBrandStats } from '../../hooks/useBrandStats';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Smile, Frown, Meh } from 'lucide-react';

// Color definitions for both themes
const COLORS_LIGHT = {
  positive: '#10b981', // emerald-500
  negative: '#ef4444', // red-500
  neutral: '#6b7280'   // gray-500
};

const COLORS_DARK = {
  positive: '#34d399', // emerald-400
  negative: '#f87171', // red-400
  neutral: '#9ca3af'   // gray-400
};

const sentimentIcons = {
  positive: Smile,
  negative: Frown,
  neutral: Meh
};

export default function SentimentChart({ brand, timeframe = '7d' }) {
  const { data, isLoading } = useBrandStats(brand, timeframe);
  const { theme } = useTheme();

  // Get colors based on theme
  const COLORS = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!data?.stats?.sentiment) return [];
    
    const total = Object.values(data.stats.sentiment).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(data.stats.sentiment)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: COLORS[name],
        icon: sentimentIcons[name]
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data, COLORS]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      
      return (
        <div className={`
          p-3 rounded-lg shadow-lg border backdrop-blur-sm
          ${theme === 'dark' 
            ? 'bg-white border-slate-600 text-slate-900' 
            : 'bg-slate-800 border-slate-200 text-white'
          }
        `}>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" style={{ color: data.color }} />
            <p className="font-semibold">{data.name}</p>
          </div>
          <p className="text-sm">
            <span className="font-medium">{data.value.toLocaleString()}</span> mentions
          </p>
          <p className="text-sm opacity-80">
            {data.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => {
          const Icon = sentimentIcons[entry.value.toLowerCase()];
          
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <Icon className="w-4 h-4" style={{ color: entry.color }} />
              <span className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}
              `}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

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

  const totalMentions = chartData.reduce((sum, item) => sum + item.value, 0);

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
        <h3 className={`
          text-lg font-semibold
          ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
        `}>
          Sentiment Distribution
        </h3>
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${theme === 'dark' 
            ? 'bg-slate-700 text-slate-300' 
            : 'bg-slate-100 text-slate-700'
          }
        `}>
          {totalMentions.toLocaleString()} total
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationDuration={500}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={theme === 'dark' ? '#1e293b' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total count */}
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          text-center pointer-events-none opacity-50
        `}>
          <div className={`
            text-2xl font-bold 
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}>
            {totalMentions.toLocaleString()}
          </div>
          <div className={`
            text-xs
            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
          `}>
            Mentions
          </div>
        </div>
      </div>

      {/* Percentage breakdown */}
      {chartData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center text-sm">
            {chartData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`
                    font-medium
                    ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}
                  `}>
                    {item.percentage}%
                  </span>
                </div>
                <div className={`
                  text-xs
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}