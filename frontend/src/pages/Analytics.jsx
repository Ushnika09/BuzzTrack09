// client/src/pages/Analytics.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  BarChart3, 
  Download,
  Users,
  MessageCircle,
  ThumbsUp,
  AlertCircle,
  Sparkles,
  Zap
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
import { useTheme } from '../context/ThemeContext';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('24h');
  const { theme } = useTheme();
  
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['stats-overview', timeframe],
    queryFn: () => statsAPI.getOverview(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });

  const { data: sourceData, isLoading: sourceLoading } = useQuery({
    queryKey: ['sources-comparison', timeframe],
    queryFn: () => statsAPI.getSourcesComparison(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });

  const overview = overviewData?.overview;
  const brands = brandsData?.brands || [];

  const handleExport = () => {
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

  const bgClass = theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-blue-50/20';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';

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
    <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500`}>
      <div className="p-6 lg:p-8">
        <div className="space-y-8">

          {/* Premium Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-purple-600
                shadow-2xl shadow-blue-500/25
              `}>
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className={`mt-2 ${mutedText} flex items-center gap-2`}>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Comprehensive insights across all tracked brands
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div data-tour="timeframe-selector">
                <TimeframeSelector value={timeframe} onChange={setTimeframe} />
              </div>
              
              <button
                data-tour="export-button"
                onClick={handleExport}
                className={`
                  flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold
                  transition-all duration-300 hover:scale-105 active:scale-95
                  shadow-lg hover:shadow-xl backdrop-blur-sm border
                  ${theme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50'
                    : 'bg-white/80 border-slate-200/50 text-slate-700 hover:bg-white'
                  }
                `}
              >
                <Download className="w-5 h-5" />
                Export Data
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ChartSkeleton key={i} />
              ))}
            </div>
          ) : overview ? (
            <div data-tour="analytics-metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Total Mentions" value={overview.totalMentions} icon={MessageCircle} color="blue" trend="+12%" description="Across all platforms" theme={theme} />
              <MetricCard label="Tracked Brands" value={overview.totalBrands} icon={Users} color="purple" description="Active monitoring" theme={theme} />
              <MetricCard label="Positive Rate" value={`${overview.sentimentOverview?.positive || 0}%`} icon={ThumbsUp} color="green" trend="+5%" description="Positive sentiment" theme={theme} />
              <MetricCard label="Engagement Score" value={Math.round(overview.avgEngagement || 0)} icon={Zap} color="orange" description="Average per mention" theme={theme} />
            </div>
          ) : null}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div data-tour="platform-breakdown">
              <PlatformBreakdown data={overview?.platformBreakdown} isLoading={overviewLoading} />
            </div>
            <div data-tour="top-brands">
              <TopPerformingBrands brands={overview?.topPerformingBrands} isLoading={overviewLoading} />
            </div>
          </div>

          <div data-tour="source-comparison">
            <SourceComparisonChart data={sourceData?.comparison} isLoading={sourceLoading} timeframe={timeframe} />
          </div>

          <div data-tour="brand-comparison">
            <BrandComparisonChart brands={brands} timeframe={timeframe} />
          </div>

          <div data-tour="sentiment-trends">
            <SentimentTrendChart brands={brands} timeframe={timeframe} />
          </div>

        </div>
      </div>
    </div>
  );
}

// MetricCard remains unchanged
function MetricCard({ label, value, icon: Icon, color, trend, description, theme }) {
  const colorConfig = {
    blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', trend: 'text-blue-600 dark:text-blue-400' },
    purple: { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', trend: 'text-purple-600 dark:text-purple-400' },
    green: { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', trend: 'text-green-600 dark:text-green-400' },
    orange: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', trend: 'text-orange-600 dark:text-orange-400' },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl border backdrop-blur-sm
      transition-all duration-500 hover:scale-105 hover:shadow-2xl
      ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}
    `}>
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.gradient} rounded-t-2xl`} />

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {label}
            </h3>
            {description && (
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                {description}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-4 h-4 ${config.trend}`} />
              <span className={`text-sm font-semibold ${config.trend}`}>{trend}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-br ${config.gradient} mix-blend-overlay`} />
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none bg-gradient-to-r ${config.gradient} blur-xl -inset-2`} />
    </div>
  );
}