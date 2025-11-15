import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMentions } from '../../hooks/useMentions';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Calendar, TrendingUp, BarChart3, Clock } from 'lucide-react';

// Timeframe options for the filter
const TIMEFRAME_OPTIONS = [
  { value: '1h', label: '1H', fullLabel: 'Last 1 Hour' },
  { value: '6h', label: '6H', fullLabel: 'Last 6 Hours' },
  { value: '24h', label: '24H', fullLabel: 'Last 24 Hours' },
  { value: '7d', label: '7D', fullLabel: 'Last 7 Days' },
  { value: '30d', label: '30D', fullLabel: 'Last 30 Days' }
];

// Enhanced Timeframe Filter with better styling
const TimeframeFilter = ({ value, onChange, theme }) => {
  return (
    <div className={`
      flex items-center gap-1 p-1 rounded-xl
      ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}
    `}>
      {TIMEFRAME_OPTIONS.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
            ${value === option.value
              ? theme === 'dark'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-600 text-white shadow-lg'
              : theme === 'dark'
                ? 'text-slate-300 hover:text-white hover:bg-slate-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Helper function to calculate start date based on timeframe
const getStartDate = (timeframe) => {
  const now = new Date();
  const timeframes = {
    '1h': 1 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  
  const ms = timeframes[timeframe] || timeframes['24h'];
  return new Date(now.getTime() - ms).toISOString();
};

// Helper to group data by time intervals based on timeframe
const groupDataByTimeframe = (mentions, timeframe) => {
  if (mentions.length === 0) return [];

  let intervalMs;
  let dateFormatter;
  
  switch (timeframe) {
    case '1h':
      intervalMs = 10 * 60 * 1000; // 10 minute intervals
      dateFormatter = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      break;
    case '6h':
      intervalMs = 30 * 60 * 1000; // 30 minute intervals
      dateFormatter = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      break;
    case '24h':
      intervalMs = 2 * 60 * 60 * 1000; // 2 hour intervals
      dateFormatter = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit' });
      break;
    case '7d':
      intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
      dateFormatter = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      break;
    case '30d':
      intervalMs = 2 * 24 * 60 * 60 * 1000; // 2 day intervals
      dateFormatter = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      break;
    default:
      intervalMs = 24 * 60 * 60 * 1000;
      dateFormatter = (date) => date.toLocaleDateString();
  }

  const grouped = {};
  const now = new Date();
  const startTime = now.getTime() - getTimeframeMs(timeframe);
  
  // Initialize all intervals with 0 to ensure consistent data
  for (let time = startTime; time <= now.getTime(); time += intervalMs) {
    const intervalTime = new Date(Math.floor(time / intervalMs) * intervalMs);
    const key = dateFormatter(intervalTime);
    grouped[key] = 0;
  }

  // Count mentions in each interval
  mentions.forEach(mention => {
    const date = new Date(mention.timestamp);
    const intervalTime = new Date(Math.floor(date.getTime() / intervalMs) * intervalMs);
    const key = dateFormatter(intervalTime);
    
    grouped[key] = (grouped[key] || 0) + 1;
  });

  // Convert to array and ensure proper sorting
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => {
      try {
        const dateA = parseDateFromLabel(a.date, timeframe);
        const dateB = parseDateFromLabel(b.date, timeframe);
        return dateA - dateB;
      } catch (e) {
        return 0;
      }
    })
    .filter(item => item.count > 0 || timeframe === '1h' || timeframe === '6h');
};

// Helper to parse date from formatted label
const parseDateFromLabel = (label, timeframe) => {
  const now = new Date();
  
  if (timeframe === '1h' || timeframe === '6h' || timeframe === '24h') {
    const [time, modifier] = label.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes ? parseInt(minutes) : 0, 0, 0);
    return date;
  } else {
    return new Date(label);
  }
};

// Helper to get timeframe in milliseconds
const getTimeframeMs = (timeframe) => {
  const timeframes = {
    '1h': 1 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return timeframes[timeframe] || timeframes['24h'];
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`
        p-3 rounded-lg shadow-xl border backdrop-blur-sm
        ${theme === 'dark' 
          ? 'bg-slate-800 border-slate-600 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
        }
      `}>
        <p className="font-semibold">{label}</p>
        <p className="text-sm">
          <span className="font-medium">{payload[0].value}</span> mentions
        </p>
      </div>
    );
  }
  return null;
};

export default function VolumeChart({ brand, initialTimeframe = '24h', onTimeframeChange }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialTimeframe);
  const { theme } = useTheme();
  
  // Calculate start date based on timeframe
  const startDate = useMemo(() => getStartDate(selectedTimeframe), [selectedTimeframe]);
  
  const { data, isLoading, error } = useMentions({ 
    brand,
    startDate,
    limit: 2000
  });

  // Handle timeframe change
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    }
  };

  if (isLoading) return <ChartSkeleton />;

  if (error) {
    console.error('VolumeChart error:', error);
    return (
      <EmptyState
        type="error"
        title="Error Loading Data"
        description="Failed to load volume data"
        className="h-64"
      />
    );
  }

  const mentions = data?.mentions || [];

  if (mentions.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Volume Data"
        description={`No mentions found for ${brand} in the last ${selectedTimeframe}`}
        className="h-64"
      />
    );
  }

  // Group mentions by appropriate time intervals based on timeframe
  const chartData = groupDataByTimeframe(mentions, selectedTimeframe);

  // Calculate stats for summary
  const totalMentions = mentions.length;
  const peakMention = Math.max(...chartData.map(item => item.count));
  const averageMentions = Math.round(totalMentions / chartData.length);

  // Get gradient colors based on theme
  const barGradient = theme === 'dark' 
    ? ['#60a5fa', '#3b82f6', '#2563eb'] 
    : ['#93c5fd', '#3b82f6', '#1d4ed8'];

  // If no data points after grouping, show empty state
  if (chartData.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Data Points"
        description="No mention data available for the selected timeframe after grouping."
        className="h-64"
      />
    );
  }

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
            w-10 h-10 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-cyan-500
            shadow-lg
          `}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`
              text-lg font-semibold
              ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
            `}>
              Mention Volume
            </h3>
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Mentions over time
            </p>
          </div>
        </div>
        
        <TimeframeFilter 
          value={selectedTimeframe} 
          onChange={handleTimeframeChange}
          theme={theme}
        />
      </div>
      
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} 
              opacity={0.5}
            />
            <XAxis 
              dataKey="date" 
              tick={{ 
                fontSize: 11,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: theme === 'dark' ? '#cbd5e1' : '#64748b'
              }}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={barGradient[index % barGradient.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Summary Stats */}
      <div className={`
        mt-6 pt-4 border-t
        ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
      `}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className={`
                text-lg font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {peakMention}
              </span>
            </div>
            <div className={`
              text-xs
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Peak
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <span className={`
                text-lg font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {averageMentions}
              </span>
            </div>
            <div className={`
              text-xs
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Average
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className={`
                text-lg font-bold
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                {totalMentions}
              </span>
            </div>
            <div className={`
              text-xs
              ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            `}>
              Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}