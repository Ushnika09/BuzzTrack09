// client/src/components/Dashboard/MentionFeed.jsx
import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Calendar, ExternalLink, MapPin } from 'lucide-react';
import { useMentions } from '../../hooks/useMentions';
import { MentionSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import { useToast } from '../../context/ToastContext';

const sentimentColors = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const sourceIcons = {
  reddit: { color: 'text-orange-500', icon: '👾' },
  news: { color: 'text-blue-500', icon: '📰' },
  twitter: { color: 'text-sky-500', icon: '🐦' },
};

export default function MentionFeed({ brand, filters = {} }) {
  const [selectedMention, setSelectedMention] = useState(null);
  const { data, isLoading, error } = useMentions({ brand, ...filters });
  const { toast } = useToast();

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

  const handleSourceClick = (mention) => {
    if (mention.url) {
      window.open(mention.url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('No source URL available for this mention');
    }
  };

  return (
    <div className="space-y-4">
      {mentions.map((mention) => (
        <div
          key={mention.id}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => setSelectedMention(mention)}
        >
          <div className="flex items-start gap-3">
            {/* Avatar/Platform Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {sourceIcons[mention.source]?.icon || '📊'}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-medium text-slate-900 dark:text-white">
                  {mention.author || 'Unknown User'}
                </span>
                
                <span className={`px-2 py-1 text-xs rounded-full ${sentimentColors[mention.sentiment]}`}>
                  {mention.sentiment}
                </span>
                
                <span className={`text-xs font-medium ${sourceIcons[mention.source]?.color}`}>
                  {mention.source}
                </span>
                
                {mention.platform && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {mention.platform}
                  </span>
                )}
                
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTime(mention.timestamp)}
                </span>
              </div>

              {/* Content */}
              <p className="text-slate-700 dark:text-slate-300 mb-3 line-clamp-3">
                {mention.content}
              </p>

              {/* Engagement & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{mention.engagement?.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{mention.engagement?.comments || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{mention.engagement?.shares || 0}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSourceClick(mention);
                  }}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  View Source
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}