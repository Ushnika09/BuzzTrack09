import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMentions } from '../../hooks/useMentions';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useMemo, useState } from 'react';

// Timeframe options for the filter
const TIMEFRAME_OPTIONS = [
  { value: '1h', label: 'Last 1 Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' }
];

// Timeframe filter component
const TimeframeFilter = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
    >
      {TIMEFRAME_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
      // Parse back to date for proper sorting
      try {
        const dateA = parseDateFromLabel(a.date, timeframe);
        const dateB = parseDateFromLabel(b.date, timeframe);
        return dateA - dateB;
      } catch (e) {
        return 0;
      }
    })
    .filter(item => item.count > 0 || timeframe === '1h' || timeframe === '6h'); // Show all intervals for short timeframes
};

// Helper to parse date from formatted label
const parseDateFromLabel = (label, timeframe) => {
  const now = new Date();
  
  if (timeframe === '1h' || timeframe === '6h' || timeframe === '24h') {
    // Time formats - assume today
    const [time, modifier] = label.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes ? parseInt(minutes) : 0, 0, 0);
    return date;
  } else {
    // Date formats
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

export default function VolumeChart({ brand, initialTimeframe = '24h', onTimeframeChange }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialTimeframe);
  
  // Calculate start date based on timeframe
  const startDate = useMemo(() => getStartDate(selectedTimeframe), [selectedTimeframe]);
  
  const { data, isLoading, error } = useMentions({ 
    brand,
    startDate,
    limit: 2000 // Increased limit for longer timeframes
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

  // Format tooltip based on timeframe
  const formatTooltipLabel = (date) => {
    return `Time: ${date}`;
  };

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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Mention Volume
        </h3>
        <TimeframeFilter 
          value={selectedTimeframe} 
          onChange={handleTimeframeChange}
        />
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              formatter={(value) => [`${value} mentions`, 'Volume']}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          Total: <strong className="text-slate-900 dark:text-white">{mentions.length}</strong> mentions
        </span>
        <span>
          Data Points: <strong className="text-slate-900 dark:text-white">{chartData.length}</strong>
        </span>
        <span>
          Period: <strong className="text-slate-900 dark:text-white">
            {TIMEFRAME_OPTIONS.find(opt => opt.value === selectedTimeframe)?.label}
          </strong>
        </span>
      </div>
    </div>
  );
}