// client/src/components/UI/EmptyState.jsx
import { Search, TrendingUp, Plus, Database } from 'lucide-react';

const illustrations = {
  noMentions: Search,
  noBrands: Plus,
  noData: Database,
  noResults: Search,
  noSpikes: TrendingUp,
};

export default function EmptyState({ 
  type = 'noData',
  title,
  description,
  action,
  actionLabel,
  className = ''
}) {
  const Icon = illustrations[type];

  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
        <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title || getDefaultTitle(type)}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
        {description || getDefaultDescription(type)}
      </p>

      {action && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}

function getDefaultTitle(type) {
  const titles = {
    noMentions: 'No Mentions Yet',
    noBrands: 'No Brands Tracked',
    noData: 'No Data Available',
    noResults: 'No Results Found',
    noSpikes: 'No Spikes Detected',
  };
  return titles[type] || 'No Data';
}

function getDefaultDescription(type) {
  const descriptions = {
    noMentions: 'Start tracking brands to see mentions appear here in real-time.',
    noBrands: 'Add your first brand to start monitoring mentions across the web.',
    noData: 'Data will appear here once you start tracking brands.',
    noResults: 'Try adjusting your filters or search terms.',
    noSpikes: 'No unusual activity detected. Everything is running smoothly.',
  };
  return descriptions[type] || 'There is no data to display at the moment.';
}