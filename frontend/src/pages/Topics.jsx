// client/src/pages/Topics.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hash, TrendingUp, Grid3x3 } from 'lucide-react';
import { brandsAPI, topicsAPI } from '../services/api';
import TopicCloud from '../components/Dashboard/TopicCloud';
import TrendingTopics from '../components/Dashboard/TrendingTopics';
import TopicClusters from '../components/Topics/TopicClusters';
import TopicComparison from '../components/Topics/TopicComparison';
import TimeframeSelector from '../components/Analytics/TimeframeSelector';
import EmptyState from '../components/UI/EmptyState';
import { ChartSkeleton } from '../components/UI/Skeleton';

export default function Topics() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });

  const brands = brandsData?.brands || [];

  // Set first brand as default
  if (brands.length > 0 && !selectedBrand) {
    setSelectedBrand(brands[0]);
  }

  if (brands.length === 0) {
    return (
      <EmptyState
        type="noBrands"
        title="No Topics Available"
        description="Add brands to start tracking topics and themes"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Hash className="w-8 h-8 text-purple-600" />
            Topic Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Discover what people are talking about
          </p>
        </div>

        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>

      {/* Brand Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`
              px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
              ${selectedBrand === brand
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <TrendingTopics brand={selectedBrand} limit={8} />

        {/* Topic Cloud */}
        <TopicCloud brand={selectedBrand} timeframe={timeframe} limit={30} />
      </div>

      {/* Topic Clusters */}
      <TopicClusters brand={selectedBrand} timeframe={timeframe} />

      {/* Cross-Brand Topic Comparison */}
      {brands.length > 1 && (
        <TopicComparison timeframe={timeframe} />
      )}
    </div>
  );
}