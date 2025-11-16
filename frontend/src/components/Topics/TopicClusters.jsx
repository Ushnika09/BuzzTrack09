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
  Filter,
  Search,
  AlertCircle
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
    queryFn: async () => {
      const response = await topicsAPI.getClusters(brand, timeframe);
      return response.data;
    },
    enabled: !!brand,
    refetchInterval: 60000,
  });

  // Theme classes
  const cardBg = theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/95';
  const borderClass = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/80';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80';
  const inputBg = theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50/80';
  const inputBorder = theme === 'dark' ? 'border-slate-600/50' : 'border-slate-300/80';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';

  if (isLoading) return <ChartSkeleton className="h-96" />;

  if (error) {
    return (
      <div className={`${cardBg} ${borderClass} border-2 rounded-2xl p-12 backdrop-blur-sm`}>
        <EmptyState
          type="error"
          title="Failed to Load Clusters"
          description={error.message || "Unable to fetch topic clusters. Please try again later."}
          icon={<AlertCircle className="w-16 h-16 text-rose-500" />}
        />
      </div>
    );
  }

  if (!data || !data.clusters || data.clusters.length === 0) {
    return (
      <div className={`${cardBg} ${borderClass} border-2 rounded-2xl p-12 backdrop-blur-sm`}>
        <EmptyState
          type="noData"
          title="No Topic Clusters Yet"
          description="AI is analyzing conversations. Clusters will appear here soon."
          icon={<Sparkles className="w-16 h-16 text-purple-500 animate-pulse" />}
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
          return (b.avgEngagement || 0) - (a.avgEngagement || 0);
        default:
          return b.count - a.count;
      }
    });

  const sentimentConfig = {
    positive: { 
      dot: 'bg-emerald-500', 
      text: 'text-emerald-600 dark:text-emerald-400', 
      bg: theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50/80',
      border: theme === 'dark' ? 'border-emerald-800' : 'border-emerald-200',
      ring: 'ring-emerald-500/20'
    },
    neutral: { 
      dot: 'bg-slate-500', 
      text: 'text-slate-600 dark:text-slate-400',
      bg: theme === 'dark' ? 'bg-slate-900/20' : 'bg-slate-50/80',
      border: theme === 'dark' ? 'border-slate-800' : 'border-slate-200',
      ring: 'ring-slate-500/20'
    },
    negative: { 
      dot: 'bg-rose-500', 
      text: 'text-rose-600 dark:text-rose-400',
      bg: theme === 'dark' ? 'bg-rose-900/20' : 'bg-rose-50/80',
      border: theme === 'dark' ? 'border-rose-800' : 'border-rose-200',
      ring: 'ring-rose-500/20'
    },
  };

  const maxCount = Math.max(...data.clusters.map(c => c.count));

  const getGrowthIndicator = (count) => {
    const ratio = count / maxCount;
    if (ratio >= 0.7) return { 
      color: 'text-rose-600 dark:text-rose-400', 
      label: 'Very High', 
      icon: '🔥',
      bg: 'bg-gradient-to-r from-rose-500 to-orange-500'
    };
    if (ratio >= 0.4) return { 
      color: 'text-orange-600 dark:text-orange-400', 
      label: 'High', 
      icon: '📈',
      bg: 'bg-gradient-to-r from-orange-500 to-amber-500'
    };
    if (ratio >= 0.2) return { 
      color: 'text-emerald-600 dark:text-emerald-400', 
      label: 'Growing', 
      icon: '📊',
      bg: 'bg-gradient-to-r from-emerald-500 to-green-500'
    };
    return { 
      color: mutedText, 
      label: 'Stable', 
      icon: '📉',
      bg: theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
    };
  };

  const getEngagementLevel = (engagement) => {
    if (engagement > 100) return { 
      color: 'text-purple-600 dark:text-purple-400', 
      label: 'Viral', 
      bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100/80'
    };
    if (engagement > 50) return { 
      color: 'text-blue-600 dark:text-blue-400', 
      label: 'High', 
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100/80'
    };
    if (engagement > 20) return { 
      color: 'text-emerald-600 dark:text-emerald-400', 
      label: 'Good', 
      bg: theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-100/80'
    };
    return { 
      color: mutedText, 
      label: 'Low', 
      bg: theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-100/80'
    };
  };

  const totalMentions = data.clusters.reduce((sum, c) => sum + c.count, 0);
  const avgEngagement = data.clusters.reduce((sum, c) => sum + (c.avgEngagement || 0), 0) / data.clusters.length;

  return (
    <div className={`${cardBg} ${borderClass} border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm`}>
      {/* Premium Header with Live Stats */}
      <div className={`p-6 border-b-2 ${borderClass} ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-purple-500/5 to-pink-500/5' 
          : 'bg-gradient-to-r from-purple-50/60 to-pink-50/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl">
              <Grid3x3 className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Topic Clusters
              </h3>
              <p className={`text-sm ${mutedText} flex items-center gap-2 mt-1`}>
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                AI-powered conversation analysis • Live insights
              </p>
            </div>
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-800/30' 
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/60'
            }`}>
              <div className={`text-2xl font-black ${textClass}`}>
                {filteredClusters.length}
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">Clusters</div>
            </div>
            <div className={`text-center p-3 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-800/30' 
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/60'
            }`}>
              <div className={`text-2xl font-black ${textClass}`}>
                {totalMentions.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">Mentions</div>
            </div>
            <div className={`text-center p-3 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-800/30' 
                : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/60'
            }`}>
              <div className={`text-2xl font-black ${textClass}`}>
                {avgEngagement.toFixed(0)}
              </div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Avg Engage</div>
            </div>
          </div>
        </div>

        {/* Premium Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {/* Enhanced Search */}
          <div className="flex-1 relative group">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${mutedText} group-focus-within:text-purple-500 transition-colors`} />
            <input
              type="text"
              placeholder="Search topics, keywords, themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${inputBorder} ${inputBg} text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 ${textClass} backdrop-blur-sm`}
            />
          </div>

          {/* Enhanced Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedText} pointer-events-none`} />
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className={`pl-10 pr-4 py-3 rounded-xl border-2 ${inputBorder} ${inputBg} text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 ${textClass} appearance-none backdrop-blur-sm`}
              >
                <option value="all">All Sentiments</option>
                <option value="positive">😊 Positive</option>
                <option value="neutral">😐 Neutral</option>
                <option value="negative">😞 Negative</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 rounded-xl border-2 ${inputBorder} ${inputBg} text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 ${textClass} backdrop-blur-sm`}
            >
              <option value="mentions">📊 Most Mentions</option>
              <option value="growth">📈 Highest Growth</option>
              <option value="engagement">💬 Top Engagement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Premium Clusters List */}
      <div className="p-6 space-y-4">
        {filteredClusters.map((cluster, index) => {
          const isExpanded = expandedCluster === cluster.id;
          const sentiment = sentimentConfig[cluster.sentiment] || sentimentConfig.neutral;
          const growth = getGrowthIndicator(cluster.count);
          const engagement = getEngagementLevel(cluster.avgEngagement || 0);

          return (
            <div
              key={cluster.id}
              className="group relative"
            >
              {/* Premium Glow Effect for Top 3 */}
              {index < 3 && (
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500 pointer-events-none blur-2xl -z-10
                  ${index === 0 ? theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-500/10' :
                    index === 1 ? theme === 'dark' ? 'bg-slate-500/20' : 'bg-slate-500/10' : 
                    theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-500/10'
                  }
                `} />
              )}

              <div
                className={`
                  rounded-2xl border-2 transition-all duration-500 overflow-hidden backdrop-blur-sm
                  ${isExpanded 
                    ? 'border-purple-500/60 shadow-2xl shadow-purple-500/20 ring-4 ring-purple-500/10 scale-[1.02]' 
                    : `${borderClass} hover:border-purple-400/50 hover:shadow-xl hover:scale-[1.01]`
                  }
                  ${cardBg}
                `}
              >
                {/* Enhanced Cluster Header */}
                <button
                  onClick={() => setExpandedCluster(isExpanded ? null : cluster.id)}
                  className={`w-full p-6 flex items-center justify-between ${hoverBg} transition-all duration-300`}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {/* Ultra-Premium Rank Badge */}
                    <div className={`
                      relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-2xl
                      transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                      ${index < 3 
                        ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500' 
                        : 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500'
                      }
                    `}>
                      {index + 1}
                      {index < 3 && (
                        <>
                          <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-300 animate-pulse" />
                          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping" />
                        </>
                      )}
                    </div>

                    {/* Enhanced Topic Info */}
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h4 className={`text-xl font-black ${textClass} capitalize truncate`}>
                          #{cluster.topic}
                        </h4>
                        
                        {/* Dynamic Status Badges */}
                        {growth.icon && (
                          <span className={`
                            px-3 py-1.5 text-xs font-black rounded-full text-white shadow-lg flex items-center gap-1
                            ${growth.bg}
                          `}>
                            {growth.icon} {growth.label}
                          </span>
                        )}

                        {cluster.keywords && cluster.keywords.length > 0 && (
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                            theme === 'dark' 
                              ? 'bg-blue-900/30 text-blue-300' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {cluster.keywords.length} keywords
                          </span>
                        )}
                      </div>
                      
                      {/* Premium Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${sentiment.bg} ${sentiment.border}`}>
                          <div className={`w-3 h-3 rounded-full ${sentiment.dot} ring-4 ${sentiment.ring}`} />
                          <span className={`font-bold text-xs ${sentiment.text} capitalize`}>
                            {cluster.sentiment}
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                          theme === 'dark' 
                            ? 'bg-slate-700/50 border-slate-600' 
                            : 'bg-slate-100 border-slate-200'
                        }`}>
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className={`font-bold text-xs ${textClass}`}>
                            {cluster.count.toLocaleString()}
                          </span>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                          theme === 'dark' 
                            ? 'bg-slate-700/50 border-slate-600' 
                            : 'bg-slate-100 border-slate-200'
                        }`}>
                          <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className={`font-bold text-xs ${textClass}`}>
                            {(cluster.avgEngagement || 0).toFixed(0)}
                          </span>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                          theme === 'dark' 
                            ? 'bg-slate-700/50 border-slate-600' 
                            : 'bg-slate-100 border-slate-200'
                        }`}>
                          <TrendingUp className={`w-4 h-4 ${growth.color}`} />
                          <span className={`font-bold text-xs ${growth.color}`}>
                            {growth.label}
                          </span>
                        </div>
                      </div>

                      {/* Keywords Preview */}
                      {cluster.keywords && cluster.keywords.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {cluster.keywords.slice(0, 5).map((keyword, idx) => (
                            <span 
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-2 ${sentiment.bg} ${sentiment.border}`}
                            >
                              {keyword}
                            </span>
                          ))}
                          {cluster.keywords.length > 5 && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${mutedText} ${
                              theme === 'dark' 
                                ? 'bg-slate-700/50 border-slate-600' 
                                : 'bg-slate-100 border-slate-200'
                            } border-2`}>
                              +{cluster.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Premium Expand Button */}
                  <div className={`
                    p-4 rounded-xl transition-all duration-500 flex-shrink-0 border-2
                    ${isExpanded 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg border-transparent' 
                      : `${inputBg} ${mutedText} ${inputBorder} group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:border-purple-300 dark:group-hover:border-purple-700`
                    }
                  `}>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 animate-bounce" />
                    ) : (
                      <ChevronDown className="w-6 h-6 group-hover:animate-bounce" />
                    )}
                  </div>
                </button>

                {/* Premium Expanded Content */}
                {isExpanded && (
                  <div className={`px-6 pb-6 pt-4 border-t-2 ${borderClass} ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-b from-transparent to-purple-500/5' 
                      : 'bg-gradient-to-b from-transparent to-purple-50/30'
                  }`}>
                    {/* Enhanced Metrics Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className={`p-4 rounded-xl border-2 ${engagement.bg} ${sentiment.border} text-center transition-transform hover:scale-105`}>
                        <div className={`text-xs font-bold ${engagement.color} mb-1`}>Engagement</div>
                        <div className={`text-2xl font-black ${textClass}`}>
                          {(cluster.avgEngagement || 0).toFixed(0)}
                        </div>
                        <div className={`text-xs font-semibold ${engagement.color}`}>
                          {engagement.label}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${sentiment.bg} ${sentiment.border} text-center transition-transform hover:scale-105`}>
                        <div className={`text-xs font-bold ${sentiment.text} mb-1`}>Sentiment</div>
                        <div className={`text-2xl font-black ${textClass}`}>
                          {cluster.sentiment === 'positive' ? '😊' : cluster.sentiment === 'negative' ? '😞' : '😐'}
                        </div>
                        <div className={`text-xs font-semibold ${sentiment.text} capitalize`}>
                          {cluster.sentiment}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-800' 
                          : 'bg-blue-100 border-blue-200'
                      } text-center transition-transform hover:scale-105`}>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Total Reach</div>
                        <div className={`text-2xl font-black ${textClass}`}>
                          {cluster.count.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          mentions
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${
                        theme === 'dark' 
                          ? 'bg-purple-900/30 border-purple-800' 
                          : 'bg-purple-100 border-purple-200'
                      } text-center transition-transform hover:scale-105`}>
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Keywords</div>
                        <div className={`text-2xl font-black ${textClass}`}>
                          {cluster.keywords?.length || 0}
                        </div>
                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          identified
                        </div>
                      </div>
                    </div>

                    {/* Sample Mentions */}
                    {cluster.mentions && cluster.mentions.length > 0 && (
                      <div className="space-y-3">
                        <h5 className={`text-sm font-black ${textClass} flex items-center gap-2 mb-4`}>
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          Top Mentions ({cluster.mentions.length})
                        </h5>
                        {cluster.mentions.slice(0, 3).map((mention) => (
                          <a
                            key={mention.id}
                            href={mention.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                              block p-5 rounded-xl border-2 transition-all duration-300 group backdrop-blur-sm
                              ${cardBg} ${borderClass} hover:shadow-xl hover:border-purple-400/60 hover:scale-[1.02]
                            `}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${textClass} line-clamp-3 mb-3`}>
                                  {mention.content}
                                </p>
                                <div className="flex items-center gap-3 text-xs flex-wrap">
                                  <span className={`px-3 py-1.5 rounded-full font-bold capitalize border-2 ${
                                    mention.sentiment === 'positive' 
                                      ? theme === 'dark' 
                                        ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800' 
                                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                      : mention.sentiment === 'negative'
                                      ? theme === 'dark'
                                        ? 'bg-rose-900/30 text-rose-300 border-rose-800'
                                        : 'bg-rose-100 text-rose-700 border-rose-200'
                                      : theme === 'dark'
                                      ? 'bg-slate-700 text-slate-400 border-slate-600'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    {mention.sentiment}
                                  </span>
                                  <span className={`px-3 py-1.5 rounded-full font-bold capitalize border-2 ${
                                    theme === 'dark' 
                                      ? 'bg-blue-900/30 text-blue-300 border-blue-800' 
                                      : 'bg-blue-100 text-blue-700 border-blue-200'
                                  }`}>
                                    {mention.source}
                                  </span>
                                  <span className={`font-semibold ${mutedText}`}>
                                    {new Date(mention.timestamp).toLocaleDateString()}
                                  </span>
                                  {mention.engagement && (
                                    <span className={`px-3 py-1.5 rounded-full font-bold border-2 ${
                                      theme === 'dark' 
                                        ? 'bg-purple-900/30 text-purple-300 border-purple-800' 
                                        : 'bg-purple-100 text-purple-700 border-purple-200'
                                    }`}>
                                      💬 {mention.engagement.comments || 0}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-1 flex-shrink-0 group-hover:scale-110" />
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Footer with Insights */}
      {filteredClusters.length > 0 && (
        <div className={`px-6 py-5 border-t-2 ${borderClass} ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-800 to-purple-900/10' 
            : 'bg-gradient-to-r from-slate-50 to-purple-50/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm font-semibold ${textClass}`}>
              Showing <span className="text-purple-600 dark:text-purple-400 font-black">{filteredClusters.length}</span> of <span className="font-black">{data.clusters.length}</span> clusters
            </div>
            <div className={`text-xs ${mutedText} flex items-center gap-2`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}