// client/src/components/Topics/TopicClusters.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid3x3, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

const sentimentColors = {
  positive: 'bg-green-500',
  neutral: 'bg-slate-500',
  negative: 'bg-red-500',
};

export default function TopicClusters({ brand, timeframe = '24h' }) {
  const [expandedCluster, setExpandedCluster] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['topic-clusters', brand, timeframe],
    queryFn: () => topicsAPI.getClusters(brand, timeframe, 10).then(res => res.data),
    enabled: !!brand,
    refetchInterval: 60000,
  });

  if (isLoading) return <ChartSkeleton />;

  if (!data || !data.clusters || data.clusters.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Topic Clusters"
        description="Topic clusters will appear here as conversations are analyzed"
        className="h-64"
      />
    );
  }

  const clusters = data.clusters;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Grid3x3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Topic Clusters
        </h3>
        <span className="text-sm text-slate-600 dark:text-slate-400 ml-auto">
          {clusters.length} topics grouped by theme
        </span>
      </div>

      <div className="space-y-3">
        {clusters.map((cluster, index) => {
          const isExpanded = expandedCluster === cluster.topic;

          return (
            <div
              key={cluster.topic}
              className="border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all hover:border-purple-300 dark:hover:border-purple-700"
            >
              {/* Cluster Header */}
              <button
                onClick={() => setExpandedCluster(isExpanded ? null : cluster.topic)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
                    {index + 1}
                  </div>

                  {/* Topic Info */}
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white capitalize text-lg">
                      #{cluster.topic}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>{cluster.count} mentions</span>
                      <span>•</span>
                      <span className="capitalize flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${sentimentColors[cluster.sentiment]}`} />
                        {cluster.sentiment}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Cluster Details */}
              {isExpanded && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Sample Mentions:
                  </h4>
                  <div className="space-y-2">
                    {cluster.mentions.map((mention) => (
                      <a
                        key={mention.id}
                        href={mention.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
                              {mention.content}...
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="capitalize">{mention.source}</span>
                              <span>•</span>
                              <span className="capitalize">{mention.sentiment}</span>
                              <span>•</span>
                              <span>{new Date(mention.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 flex-shrink-0 mt-1" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}