// client/src/components/Dashboard/StatCard.jsx
import { TrendingUp, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import { useBrandStats } from '../../hooks/useBrandStats';
import { StatCardSkeleton } from '../UI/Skeleton';

const stats = [
  {
    key: 'total',
    label: 'Total Mentions',
    icon: MessageCircle,
    color: 'blue',
  },
  {
    key: 'positive',
    label: 'Positive',
    icon: ThumbsUp,
    color: 'green',
  },
  {
    key: 'negative',
    label: 'Negative',
    icon: AlertCircle,
    color: 'red',
  },
  {
    key: 'engagement',
    label: 'Avg Engagement',
    icon: TrendingUp,
    color: 'purple',
  },
];

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export default function StatCard({ brand }) {
  const { data, isLoading } = useBrandStats(brand);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statsData = data?.stats || {};
  const values = {
    total: statsData.total || 0,
    positive: statsData.sentiment?.positive || 0,
    negative: statsData.sentiment?.negative || 0,
    engagement: statsData.avgEngagement || 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.label}
              </span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {values[stat.key].toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}