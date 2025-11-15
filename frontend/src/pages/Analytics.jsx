// client/src/pages/Analytics.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { statsAPI, brandsAPI } from '../services/api';
import BrandComparisonChart from '../components/Analytics/BrandComparisonChart';
import SourceComparisonChart from '../components/Analytics/SourceComparisonChart';
import SentimentTrendChart from '../components/Analytics/SentimentTrendChart';
import TopPerformingBrands from '../components/Analytics/TopPerformingBrands';
import PlatformBreakdown from '../components/Analytics/PlatformBreakdown';
import TimeframeSelector from '../components/Analytics/TimeframeSelector';
import { ChartSkeleton } from '../components/UI/Skeleton';
import EmptyState from '../components/UI/EmptyState';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('24h');
  
  // Fetch overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['stats-overview', timeframe],
    queryFn: () => statsAPI.getOverview(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });

  // Fetch source comparison
  const { data: sourceData, isLoading: sourceLoading } = useQuery({
    queryKey: ['sources-comparison', timeframe],
    queryFn: () => statsAPI.getSourcesComparison(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });

  const overview = overviewData?.overview;
  const brands = brandsData?.brands || [];

  const handleExport = () => {
    // Export analytics data as JSON
    const data = {
      timeframe,
      overview,
      sourceComparison: sourceData?.comparison,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buzztrack-analytics-${timeframe}-${Date.now()}.json`;
    a.click();
  };

  if (brands.length === 0) {
    return (
      <EmptyState
        type="noBrands"
        title="No Analytics Available"
        description="Add brands to start tracking and view analytics"
      />
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive insights across all tracked brands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Mentions"
            value={overview.totalMentions}
            icon={TrendingUp}
            color="blue"
            trend="+12%"
          />
          <MetricCard
            label="Tracked Brands"
            value={overview.totalBrands}
            icon={PieChart}
            color="purple"
          />
          <MetricCard
            label="Positive Sentiment"
            value={`${overview.sentimentOverview?.positive || 0}%`}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            label="Reddit Mentions"
            value={overview.platformBreakdown?.reddit || 0}
            icon={BarChart3}
            color="orange"
          />
        </div>
      ) : null}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <PlatformBreakdown 
          data={overview?.platformBreakdown} 
          isLoading={overviewLoading}
        />

        {/* Top Performing Brands */}
        <TopPerformingBrands 
          brands={overview?.topPerformingBrands} 
          isLoading={overviewLoading}
        />
      </div>

      {/* Source Comparison */}
      <SourceComparisonChart 
        data={sourceData?.comparison} 
        isLoading={sourceLoading}
        timeframe={timeframe}
      />

      {/* Brand Comparison */}
      <BrandComparisonChart 
        brands={brands} 
        timeframe={timeframe}
      />

      {/* Sentiment Trend */}
      <SentimentTrendChart 
        brands={brands} 
        timeframe={timeframe}
      />
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {value.toLocaleString()}
        </div>
        
        {trend && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}