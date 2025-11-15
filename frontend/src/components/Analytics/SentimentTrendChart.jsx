// client/src/components/Analytics/SentimentTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { mentionsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, Activity, Award, Sparkles, Heart } from 'lucide-react';

export default function SentimentTrendChart({ brands, timeframe }) {
  const { theme } = useTheme();
  
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
        fullTime: new Date(timestamp),
      };

      brands.forEach(brand => {
        const data = brandData[brand]?.[timestamp];
        if (data && data.total > 0) {
          // Calculate positive sentiment percentage
          point[brand] = parseFloat(((data.positive / data.total) * 100).toFixed(1));
        } else {
          point[brand] = 0;
        }
      });

      return point;
    });

  // Calculate brand statistics
  const brandStats = brands.map(brand => {
    const brandPoints = chartData.filter(point => point[brand] > 0);
    const avgSentiment = brandPoints.length > 0 
      ? brandPoints.reduce((sum, point) => sum + point[brand], 0) / brandPoints.length 
      : 0;
    
    const maxSentiment = brandPoints.length > 0 
      ? Math.max(...brandPoints.map(point => point[brand]))
      : 0;

    const totalMentions = data.find(d => d.brand === brand)?.mentions.length || 0;

    return {
      brand,
      avgSentiment,
      maxSentiment,
      totalMentions,
      dataPoints: brandPoints.length
    };
  });

  const mostPositiveBrand = [...brandStats].sort((a, b) => b.avgSentiment - a.avgSentiment)[0];
  const mostActiveBrand = [...brandStats].sort((a, b) => b.totalMentions - a.totalMentions)[0];

  // Theme-aware colors
  const colors = theme === 'dark' 
    ? ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6']
    : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
          <p className="font-bold mb-3">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium">{entry.dataKey}</span>
                </div>
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`
              text-lg font-semibold
              ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
            `}>
              Sentiment Trend
            </h3>
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Positive sentiment percentage over time
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className={`
            px-3 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border
            ${theme === 'dark' 
              ? 'bg-slate-700/50 border-slate-600/50 text-white' 
              : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
            }
          `}>
            {brands.length} brands
          </div>
          <div className={`
            px-3 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border
            ${theme === 'dark' 
              ? 'bg-slate-700/50 border-slate-600/50 text-white' 
              : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
            }
          `}>
            {chartData.length}h period
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} 
              opacity={0.5}
            />
            <XAxis 
              dataKey="time" 
              tick={{ 
                fontSize: 11,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
              interval="preserveStartEnd"
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
              label={{ 
                value: 'Positive %', 
                angle: -90, 
                position: 'insideLeft',
                style: {
                  fill: theme === 'dark' ? '#cbd5e1' : '#64748b',
                  fontSize: 12
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {brands.map((brand, index) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ 
                  r: 4,
                  strokeWidth: 2,
                  stroke: theme === 'dark' ? '#1e293b' : '#ffffff',
                  fill: colors[index % colors.length]
                }}
                activeDot={{ 
                  r: 6,
                  strokeWidth: 2,
                  stroke: theme === 'dark' ? '#1e293b' : '#ffffff',
                  fill: colors[index % colors.length]
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Insight Cards */}
      <div className={`
        mt-6 pt-6 border-t
        ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
      `}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Most Positive Brand */}
          <div className={`
            p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'bg-emerald-900/20 border-emerald-800/50' 
              : 'bg-emerald-50 border-emerald-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${theme === 'dark' ? 'bg-emerald-800/50' : 'bg-emerald-100'}
              `}>
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className={`
                  text-xs font-semibold
                  ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}
                `}>
                  Most Positive
                </div>
                <div className={`
                  text-lg font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  {mostPositiveBrand?.brand || 'N/A'}
                </div>
              </div>
            </div>
            <div className={`
              text-2xl font-bold
              ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}
            `}>
              {mostPositiveBrand?.avgSentiment?.toFixed(1) || 0}%
            </div>
            <div className={`
              text-xs
              ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}
            `}>
              Average positive sentiment
            </div>
          </div>

          {/* Most Active Brand */}
          <div className={`
            p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'bg-blue-900/20 border-blue-800/50' 
              : 'bg-blue-50 border-blue-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'}
              `}>
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className={`
                  text-xs font-semibold
                  ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
                `}>
                  Most Active
                </div>
                <div className={`
                  text-lg font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  {mostActiveBrand?.brand || 'N/A'}
                </div>
              </div>
            </div>
            <div className={`
              text-2xl font-bold
              ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
            `}>
              {mostActiveBrand?.totalMentions?.toLocaleString() || 0}
            </div>
            <div className={`
              text-xs
              ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}
            `}>
              Total mentions
            </div>
          </div>

          {/* Peak Performance */}
          <div className={`
            p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'bg-purple-900/20 border-purple-800/50' 
              : 'bg-purple-50 border-purple-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${theme === 'dark' ? 'bg-purple-800/50' : 'bg-purple-100'}
              `}>
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className={`
                  text-xs font-semibold
                  ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}
                `}>
                  Peak Sentiment
                </div>
                <div className={`
                  text-lg font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  {mostPositiveBrand?.maxSentiment?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
            <div className={`
              text-2xl font-bold
              ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
            `}>
              {chartData.length}
            </div>
            <div className={`
              text-xs
              ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
            `}>
              Data points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}