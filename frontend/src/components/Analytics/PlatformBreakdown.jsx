// client/src/components/Analytics/PlatformBreakdown.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { Smartphone, Monitor, Globe, TrendingUp } from 'lucide-react';

// Theme-aware colors
const COLORS_LIGHT = {
  reddit: '#ff4500',
  news: '#3b82f6', 
  twitter: '#1da1f2',
  facebook: '#1877f2',
  instagram: '#e4405f',
  youtube: '#ff0000'
};

const COLORS_DARK = {
  reddit: '#ff6b35',
  news: '#60a5fa',
  twitter: '#38bdf8',
  facebook: '#4a90e2',
  instagram: '#fd5c7e',
  youtube: '#ff3333'
};

const PLATFORM_CONFIG = {
  reddit: { 
    icon: '👾', 
    name: 'Reddit',
    description: 'Community discussions'
  },
  news: { 
    icon: '📰', 
    name: 'News',
    description: 'Media coverage'
  },
  twitter: { 
    icon: '🐦', 
    name: 'Twitter',
    description: 'Social conversations'
  },
  facebook: { 
    icon: '👥', 
    name: 'Facebook',
    description: 'Social network'
  },
  instagram: { 
    icon: '📸', 
    name: 'Instagram',
    description: 'Visual content'
  },
  youtube: { 
    icon: '📺', 
    name: 'YouTube',
    description: 'Video content'
  }
};

export default function PlatformBreakdown({ data, isLoading }) {
  const { theme } = useTheme();
  const COLORS = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

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
      platform: name,
      icon: PLATFORM_CONFIG[name]?.icon || '📊',
      description: PLATFORM_CONFIG[name]?.description || 'Social platform',
      color: COLORS[name]
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const topPlatform = chartData[0];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className={`
          p-4 rounded-2xl shadow-2xl border backdrop-blur-lg
          ${theme === 'dark' 
            ? 'bg-slate-800 border-slate-600 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
          }
        `}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{data.icon}</span>
            <div>
              <p className="font-bold text-lg">{data.name}</p>
              <p className="text-sm opacity-80">{data.description}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-lg">{data.value.toLocaleString()} mentions</p>
            <p className="text-sm opacity-80">{percentage}% of total</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Label Component
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.1) return null; // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-purple-600
            shadow-lg
          `}>
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`
              text-lg font-semibold
              ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
            `}>
              Platform Breakdown
            </h3>
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Distribution across platforms
            </p>
          </div>
        </div>

        {/* Total Mentions */}
        <div className={`
          px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border
          ${theme === 'dark' 
            ? 'bg-slate-700/50 border-slate-600/50 text-white' 
            : 'bg-slate-100/50 border-slate-200/50 text-slate-700'
          }
        `}>
          {total.toLocaleString()} total
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
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
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
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          text-center pointer-events-none
        `}>
          <div className={`
            text-2xl font-bold
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}>
            {total.toLocaleString()}
          </div>
          <div className={`
            text-xs
            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
          `}>
            Mentions
          </div>
        </div>
      </div>

      {/* Enhanced Platform List */}
      <div className={`
        mt-6 pt-4 border-t
        ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
      `}>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const isTopPlatform = index === 0;
            
            return (
              <div
                key={item.platform}
                className={`
                  flex items-center justify-between p-3 rounded-xl
                  transition-all duration-300 hover:scale-105
                  ${theme === 'dark' 
                    ? 'hover:bg-slate-700/50' 
                    : 'hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Platform Icon */}
                  <div className="text-2xl">{item.icon}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        font-semibold text-sm
                        ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                      `}>
                        {item.name}
                      </span>
                      {isTopPlatform && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-amber-500" />
                          <span className={`
                            text-xs font-bold px-2 py-0.5 rounded-full
                            ${theme === 'dark' 
                              ? 'bg-amber-900/30 text-amber-300' 
                              : 'bg-amber-100 text-amber-700'
                            }
                          `}>
                            Top
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`
                      text-xs
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className={`
                    font-bold text-lg
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    {item.value.toLocaleString()}
                  </div>
                  <div className={`
                    text-sm font-medium
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `}>
                    {percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}