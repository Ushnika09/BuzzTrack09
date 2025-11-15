// client/src/components/Topics/TopicClusters.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid3x3, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  Users,
  MessageCircle,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useTheme } from '../../context/ThemeContext';

export default function TopicClusters({ brand, timeframe = '24h' }) {
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('mentions');
  const { theme } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['topic-clusters', brand, timeframe],
    queryFn: () => topicsAPI.getClusters(brand, timeframe, 20).then(res => res.data),
    enabled: !!brand,
    refetchInterval: 60000,
  });

  // Theme classes
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
  const inputBg = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50';
  const inputBorder = theme === 'dark' ? 'border-slate-600' : 'border-slate-200';

  if (isLoading) return <ChartSkeleton />;

  if (error) {
    return (
      <div className={`${cardBg} ${borderClass} border rounded-2xl p-12`}>
        <EmptyState
          type="error"
          title="Failed to Load Clusters"
          description="Unable to fetch topic clusters. Please try again later."
        />
      </div>
    );
  }

  if (!data || !data.clusters || data.clusters.length === 0) {
    return (
      <div className={`${cardBg} ${borderClass} border rounded-2xl p-12`}>
        <EmptyState
          type="noData"
          title="No Topic Clusters Yet"
          description="AI is analyzing conversations. Clusters will appear here soon."
          icon={<Sparkles className="w-16 h-16 text-purple-500" />}
        />
      </div>
    );
  }

  // Filter and sort clusters
  const filteredClusters = data.clusters
    .filter(cluster => {
      const matchesSearch = cluster.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cluster.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSentiment = sentimentFilter === 'all' || cluster.sentiment === sentimentFilter;
      return matchesSearch && matchesSentiment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'mentions':
          return b.count - a.count;
        case 'growth':
          return (b.growth || 0) - (a.growth || 0);
        case 'engagement':
          return (b.engagement || 0) - (a.engagement || 0);
        default:
          return b.count - a.count;
      }
    });

  const sentimentConfig = {
    positive: { 
      dot: 'bg-emerald-500', 
      text: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    neutral: { 
      dot: 'bg-slate-500', 
      text: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      border: 'border-slate-200 dark:border-slate-800'
    },
    negative: { 
      dot: 'bg-rose-500', 
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-800'
    },
  };

  const getGrowthColor = (growth) => {
    if (growth > 50) return 'text-rose-600 dark:text-rose-400';
    if (growth > 20) return 'text-orange-600 dark:text-orange-400';
    if (growth > 0) return 'text-emerald-600 dark:text-emerald-400';
    return mutedText;
  };

  const getEngagementLevel = (engagement) => {
    if (engagement > 8) return { color: 'text-purple-600 dark:text-purple-400', label: 'Very High' };
    if (engagement > 6) return { color: 'text-blue-600 dark:text-blue-400', label: 'High' };
    if (engagement > 4) return { color: 'text-emerald-600 dark:text-emerald-400', label: 'Medium' };
    return { color: mutedText, label: 'Low' };
  };

  return (
    <div className={`${cardBg} ${borderClass} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Enhanced Header with Stats and Controls */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Grid3x3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Topic Clusters
              </h3>
              <p className={`text-sm ${mutedText} flex items-center gap-2`}>
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI-grouped conversation themes with deep insights
              </p>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {filteredClusters.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Clusters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {data.totalMentions?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {data.avgEngagement?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Avg Engage</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics and keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${inputBorder} ${inputBg} text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300`}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border ${inputBorder} ${inputBg} text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300`}
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border ${inputBorder} ${inputBg} text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300`}
            >
              <option value="mentions">Sort by Mentions</option>
              <option value="growth">Sort by Growth</option>
              <option value="engagement">Sort by Engagement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clusters List */}
      <div className="p-6 space-y-4">
        {filteredClusters.map((cluster, index) => {
          const isExpanded = expandedCluster === cluster.id;
          const sentiment = sentimentConfig[cluster.sentiment] || sentimentConfig.neutral;
          const engagement = getEngagementLevel(cluster.engagement);

          return (
            <div
              key={cluster.id}
              className={`
                rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${isExpanded 
                  ? 'border-purple-500/40 shadow-2xl shadow-purple-500/10 ring-4 ring-purple-500/10' 
                  : `${borderClass} border hover:border-purple-400/40 hover:shadow-lg`
                }
                ${cardBg}
              `}
            >
              {/* Enhanced Cluster Header */}
              <button
                onClick={() => setExpandedCluster(isExpanded ? null : cluster.id)}
                className={`w-full p-5 flex items-center justify-between ${hoverBg} transition-all duration-300 group`}
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Enhanced Rank Badge */}
                  <div className={`
                    relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl
                    transition-all duration-300 ${isExpanded ? 'scale-110' : 'group-hover:scale-110'}
                    ${index < 3 
                      ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-600'
                    }
                  `}>
                    {index + 1}
                    {index < 3 && (
                      <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                    )}
                  </div>

                  {/* Enhanced Topic Info */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white capitalize truncate">
                        #{cluster.topic}
                      </h4>
                      {cluster.growth > 50 && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center gap-1 whitespace-nowrap">
                          <TrendingUp className="w-3 h-3" />
                          Trending Hot
                        </span>
                      )}
                      {cluster.isNew && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white whitespace-nowrap">
                          New Today
                        </span>
                      )}
                    </div>
                    
                    {/* Enhanced Metrics */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`font-semibold flex items-center gap-2 ${sentiment.text}`}>
                        <div className={`w-3 h-3 rounded-full ${sentiment.dot} ring-4 ${sentiment.ring}`} />
                        {cluster.sentiment}
                      </span>
                      
                      <span className={`flex items-center gap-1 ${mutedText} text-sm`}>
                        <Users className="w-4 h-4" />
                        {cluster.count.toLocaleString()} mentions
                      </span>

                      {cluster.growth !== undefined && (
                        <span className={`flex items-center gap-1 font-bold text-sm ${getGrowthColor(cluster.growth)}`}>
                          <TrendingUp className="w-4 h-4" />
                          +{cluster.growth}%
                        </span>
                      )}

                      {cluster.engagement !== undefined && (
                        <span className={`flex items-center gap-1 font-bold text-sm ${engagement.color}`}>
                          <MessageCircle className="w-4 h-4" />
                          {cluster.engagement}/10
                        </span>
                      )}

                      {/* Keywords */}
                      {cluster.keywords && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">•</span>
                          <div className="flex gap-1 flex-wrap">
                            {cluster.keywords.slice(0, 3).map((keyword, idx) => (
                              <span 
                                key={idx}
                                className={`px-2 py-1 rounded-full text-xs ${sentiment.bg} ${sentiment.border} border`}
                              >
                                {keyword}
                              </span>
                            ))}
                            {cluster.keywords.length > 3 && (
                              <span className={`px-2 py-1 rounded-full text-xs ${mutedText}`}>
                                +{cluster.keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Expand Button */}
                <div className={`
                  p-3 rounded-xl transition-all duration-300 flex-shrink-0
                  ${isExpanded 
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' 
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30'
                  }
                `}>
                  {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </button>

              {/* Enhanced Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`p-3 rounded-xl ${sentiment.bg} ${sentiment.border} border text-center`}>
                      <div className="text-sm font-semibold ${sentiment.text}">Sentiment Score</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {cluster.sentimentScore?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-center">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Engagement</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {cluster.engagement?.toFixed(1) || 'N/A'}/10
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-center">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Reach</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {(cluster.reach / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-center">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Virality</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {cluster.virality || '0'}%
                      </div>
                    </div>
                  </div>

                  {/* Top Mentions */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Top Mentions ({cluster.mentions?.length || 0})
                    </h5>
                    {cluster.mentions?.slice(0, 5).map((mention) => (
                      <a
                        key={mention.id}
                        href={mention.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          block p-4 rounded-xl border transition-all duration-300 group
                          ${cardBg} ${borderClass} hover:shadow-lg hover:border-purple-400/40
                        `}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-3">
                              {mention.content}
                            </p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              <span className={`px-2 py-1 rounded-full capitalize ${
                                mention.sentiment === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                mention.sentiment === 'negative' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                {mention.sentiment}
                              </span>
                              <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 capitalize">
                                {mention.source}
                              </span>
                              <span>{new Date(mention.timestamp).toLocaleDateString()}</span>
                              {mention.likes && (
                                <span className="flex items-center gap-1">
                                  ❤️ {mention.likes}
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors mt-1 flex-shrink-0" />
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

      {/* Footer with Summary */}
      {filteredClusters.length > 0 && (
        <div className={`px-6 py-4 border-t ${borderClass} ${mutedText} text-sm`}>
          Showing {filteredClusters.length} of {data.clusters.length} clusters • 
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}