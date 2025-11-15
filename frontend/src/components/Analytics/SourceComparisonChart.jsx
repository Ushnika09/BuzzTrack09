// client/src/components/Analytics/SourceComparisonChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, Zap, Award, Users, MessageCircle, Star } from 'lucide-react';

const SOURCE_CONFIG = {
  reddit: { 
    icon: '👾', 
    name: 'Reddit',
    description: 'Community discussions & forums',
    colorLight: '#ff4500',
    colorDark: '#ff6b35'
  },
  news: { 
    icon: '📰', 
    name: 'News',
    description: 'Media & press coverage',
    colorLight: '#3b82f6',
    colorDark: '#60a5fa'
  },
  twitter: { 
    icon: '🐦', 
    name: 'Twitter',
    description: 'Social conversations',
    colorLight: '#1da1f2',
    colorDark: '#38bdf8'
  },
  facebook: { 
    icon: '👥', 
    name: 'Facebook',
    description: 'Social network',
    colorLight: '#1877f2',
    colorDark: '#4a90e2'
  },
  instagram: { 
    icon: '📸', 
    name: 'Instagram',
    description: 'Visual content platform',
    colorLight: '#e4405f',
    colorDark: '#fd5c7e'
  },
  youtube: { 
    icon: '📺', 
    name: 'YouTube',
    description: 'Video content',
    colorLight: '#ff0000',
    colorDark: '#ff3333'
  }
};

export default function SourceComparisonChart({ data, isLoading, timeframe }) {
  const { theme } = useTheme();

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

  // Prepare chart data for all available sources
  const chartData = Object.entries(data)
    .filter(([source]) => SOURCE_CONFIG[source])
    .map(([source, stats]) => ({
      name: SOURCE_CONFIG[source].name,
      source,
      mentions: stats.totalMentions || 0,
      avgSentiment: stats.avgSentiment || 0,
      avgEngagement: stats.avgEngagement || 0,
      icon: SOURCE_CONFIG[source].icon,
      color: theme === 'dark' ? SOURCE_CONFIG[source].colorDark : SOURCE_CONFIG[source].colorLight,
      description: SOURCE_CONFIG[source].description,
      topBrands: stats.topBrands || []
    }))
    .sort((a, b) => b.mentions - a.mentions);

  // Calculate overall statistics
  const totalMentions = chartData.reduce((sum, item) => sum + item.mentions, 0);
  const topSource = chartData[0];
  const bestSentiment = [...chartData].sort((a, b) => b.avgSentiment - a.avgSentiment)[0];
  const bestEngagement = [...chartData].sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`
          p-4 rounded-2xl shadow-2xl border backdrop-blur-lg
          ${theme === 'dark' 
            ? 'bg-slate-800 border-slate-600 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
          }
        `}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{data.icon}</span>
            <div>
              <p className="font-bold text-lg">{data.name}</p>
              <p className="text-sm opacity-80">{data.description}</p>
            </div>
          </div>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="font-medium">{entry.name}:</span>
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.name === 'Avg Sentiment' ? entry.value.toFixed(2) : entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Sentiment color function
  const getSentimentColor = (value) => {
    if (value > 0.1) return theme === 'dark' ? '#34d399' : '#10b981';
    if (value < -0.1) return theme === 'dark' ? '#f87171' : '#ef4444';
    return theme === 'dark' ? '#94a3b8' : '#6b7280';
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
              Source Performance
            </h3>
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Comparison across content sources
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className={`
            px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border
            ${theme === 'dark' 
              ? 'bg-slate-700/50 border-slate-600/50 text-white' 
              : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
            }
          `}>
            {chartData.length} sources
          </div>
          <div className={`
            px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border
            ${theme === 'dark' 
              ? 'bg-slate-700/50 border-slate-600/50 text-white' 
              : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
            }
          `}>
            {totalMentions.toLocaleString()} mentions
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {chartData.map((source) => (
          <div
            key={source.source}
            className={`
              p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'bg-slate-700/50 border-slate-600/50' 
                : 'bg-slate-50 border-slate-200'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{source.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className={`
                  font-semibold text-lg
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  {source.name}
                </h4>
                <p className={`
                  text-sm
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  {source.description}
                </p>
              </div>
              {source.source === topSource?.source && (
                <Award className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <div className={`
                    text-xl font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {source.mentions}
                  </div>
                </div>
                <div className={`
                  text-xs font-medium
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  Mentions
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4" style={{ color: getSentimentColor(source.avgSentiment) }} />
                  <div className="text-xl font-bold" style={{ color: getSentimentColor(source.avgSentiment) }}>
                    {source.avgSentiment.toFixed(2)}
                  </div>
                </div>
                <div className={`
                  text-xs font-medium
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  Sentiment
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <div className={`
                    text-xl font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {source.avgEngagement.toFixed(1)}
                  </div>
                </div>
                <div className={`
                  text-xs font-medium
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  Engagement
                </div>
              </div>
            </div>

            {/* Top Brands */}
            {source.topBrands.length > 0 && (
              <div className={`
                mt-4 pt-4 border-t
                ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}
              `}>
                <div className={`
                  text-xs font-medium mb-2
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  Top Brands:
                </div>
                <div className="flex flex-wrap gap-1">
                  {source.topBrands.slice(0, 3).map((brand) => (
                    <span
                      key={brand}
                      className={`
                        px-2 py-1 text-xs font-medium rounded-lg border
                        ${theme === 'dark' 
                          ? 'bg-slate-600/50 border-slate-500 text-slate-300' 
                          : 'bg-white border-slate-300 text-slate-700'
                        }
                      `}
                    >
                      {brand}
                    </span>
                  ))}
                  {source.topBrands.length > 3 && (
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-lg
                      ${theme === 'dark' 
                        ? 'bg-slate-600/50 text-slate-400' 
                        : 'bg-slate-100 text-slate-500'
                      }
                    `}>
                      +{source.topBrands.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Bar Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} 
              opacity={0.5}
            />
            <XAxis 
              dataKey="name" 
              tick={{ 
                fontSize: 12,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
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
            <Bar dataKey="mentions" name="Total Mentions" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="avgEngagement" name="Avg Engagement" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-engagement-${index}`} 
                  fill={theme === 'dark' ? '#a78bfa' : '#8b5cf6'}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}