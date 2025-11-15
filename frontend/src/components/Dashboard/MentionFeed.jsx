// client/src/components/Dashboard/MentionFeed.jsx
import { useState } from 'react';
import { Heart, MessageSquare, Repeat, Calendar, ExternalLink, MapPin, TrendingUp, Eye } from 'lucide-react';
import { useMentions } from '../../hooks/useMentions';
import { MentionSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const sentimentConfig = {
  positive: {
    light: 'bg-green-50 text-green-700 border-green-200',
    dark: 'bg-green-900/20 text-green-300 border-green-800',
    gradient: 'from-green-500 to-emerald-500',
    icon: '😊'
  },
  negative: {
    light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-900/20 text-red-300 border-red-800',
    gradient: 'from-rose-500 to-red-500',
    icon: '😞'
  },
  neutral: {
    light: 'bg-slate-50 text-slate-700 border border-slate-400',
  dark: 'bg-slate-700/50 text-slate-300 border border-slate-500',
  gradient: 'bg-gradient-to-r from-slate-400 to-slate-500',
    icon: '😐'
  },
};

const platformConfig = {
  reddit: { 
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-[#FF4500]/70',  
    icon: '👾',
    name: 'Reddit'
  },
  news: { 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500',
    icon: '📰',
    name: 'News'
  }
};

export default function MentionFeed({ brand, filters = {} }) {
  const [selectedMention, setSelectedMention] = useState(null);
  const { data, isLoading, error } = useMentions({ brand, ...filters });
  const { toast } = useToast();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <MentionSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        type="noData"
        title="Error Loading Mentions"
        description="Failed to load mentions. Please try again later."
      />
    );
  }

  const mentions = data?.mentions || [];

  if (mentions.length === 0) {
    return (
      <EmptyState
        type="noMentions"
        title="No Mentions Found"
        description="No mentions match your current filters. Try adjusting your criteria or wait for new data to be collected."
      />
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSourceClick = (mention, e) => {
    e.stopPropagation();
    if (mention.url) {
      window.open(mention.url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('No source URL available for this mention');
    }
  };

  const getSentimentConfig = (sentiment) => {
    return sentimentConfig[sentiment] || sentimentConfig.neutral;
  };

  const getPlatformConfig = (platform) => {
    return platformConfig[platform] || { 
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-500',
      icon: '📊',
      name: platform 
    };
  };

  // Calculate engagement score for sorting/display
  const getEngagementScore = (mention) => {
    const engagement = mention.engagement || {};
    return (engagement.likes || 0) + (engagement.comments || 0) * 2 + (engagement.shares || 0) * 3;
  };

  return (
    <div className="space-y-4">
      {mentions.map((mention) => {
        const platform = getPlatformConfig(mention.source);
        const sentiment = getSentimentConfig(mention.sentiment);
        const engagementScore = getEngagementScore(mention);
        
        return (
          <div
            key={mention.id}
            className={`
              group relative overflow-hidden rounded-2xl border
              transition-all duration-300 cursor-pointer
              ${theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
                : 'bg-white border-slate-200 hover:border-slate-300'
              }
              p-6 hover:shadow-xl hover:-translate-y-1
            `}
            onClick={() => setSelectedMention(mention)}
          >
            {/* Sentiment Gradient Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${sentiment.gradient} rounded-t-2xl`} />

            <div className="flex items-start gap-4">
              {/* Platform Avatar with Engagement Badge */}
              <div className="relative">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center 
                  text-white text-lg font-semibold shadow-lg
                  ${platform.bgColor}
                `}>
                  {platform.icon}
                </div>
                {engagementScore > 50 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`
                      font-semibold text-base
                      ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                    `}>
                      {mention.author || 'Unknown User'}
                    </span>
                    
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${theme === 'dark' ? sentiment.dark : sentiment.light}`}>
                      <span className="mr-1">{sentiment.icon}</span>
                      {mention.sentiment}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-medium ${platform.color}`}>
                      {platform.name}
                    </span>
                    
                    <span className={`
                      flex items-center gap-1
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                    `}>
                      <Calendar className="w-3 h-3" />
                      {formatTime(mention.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Location (if available) */}
                {mention.location && (
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {mention.location}
                    </span>
                  </div>
                )}

                {/* Content */}
                <p className={`
                  mb-4 leading-relaxed text-base
                  ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}
                  line-clamp-3 group-hover:line-clamp-none
                  transition-all duration-300
                `}>
                  {mention.content}
                </p>

                {/* Engagement Metrics & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`
                      flex items-center gap-2 text-sm font-medium
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                    `}>
                      <Heart className="w-4 h-4" />
                      <span>{mention.engagement?.likes || 0}</span>
                    </div>
                    <div className={`
                      flex items-center gap-2 text-sm font-medium
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                    `}>
                      <MessageSquare className="w-4 h-4" />
                      <span>{mention.engagement?.comments || 0}</span>
                    </div>
                    <div className={`
                      flex items-center gap-2 text-sm font-medium
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                    `}>
                      <Repeat className="w-4 h-4" />
                      <span>{mention.engagement?.shares || 0}</span>
                    </div>
                    
                    {/* Engagement Score */}
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${engagementScore > 50 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }
                    `}>
                      {engagementScore} pts
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleSourceClick(mention, e)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      text-sm font-medium transition-all duration-200
                      opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0
                      ${theme === 'dark'
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                      }
                      shadow-lg hover:shadow-xl
                    `}
                  >
                    <Eye className="w-4 h-4" />
                    View Source
                  </button>
                </div>
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className={`
              absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
              transition-opacity duration-300 pointer-events-none
              ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}
            `} />
          </div>
        );
      })}
    </div>
  );
}