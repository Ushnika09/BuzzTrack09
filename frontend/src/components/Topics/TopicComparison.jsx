// client/src/components/Topics/TopicComparison.jsx
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GitCompare } from 'lucide-react';
import { topicsAPI } from '../../services/api';
import { ChartSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';

export default function TopicComparison({ timeframe = '24h' }) {
  const { data, isLoading } = useQuery({
    queryKey: ['topic-comparison', timeframe],
    queryFn: () => topicsAPI.getComparison(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });

  if (isLoading) return <ChartSkeleton />;

  if (!data || !data.comparison || data.comparison.length === 0) {
    return (
      <EmptyState
        type="noData"
        title="No Comparison Data"
        description="Topic comparison will appear here once multiple brands have mentions"
        className="h-64"
      />
    );
  }

  const comparison = data.comparison;

  // Get brand names from first item
  const brands = Object.keys(comparison[0]).filter(key => key !== 'keyword' && key !== 'total');
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cross-Brand Topic Comparison
          </h3>
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Top {comparison.length} shared topics
        </span>
      </div>

      {/* Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparison} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="keyword" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {brands.map((brand, index) => (
              <Bar
                key={brand}
                dataKey={brand}
                fill={colors[index % colors.length]}
                name={brand}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Topic Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Topic
              </th>
              {brands.map((brand) => (
                <th key={brand} className="text-center p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {brand}
                </th>
              ))}
              <th className="text-center p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, index) => (
              <tr
                key={row.keyword}
                className={`
                  border-b border-slate-100 dark:border-slate-800
                  ${index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/30' : ''}
                `}
              >
                <td className="p-3 font-medium text-slate-900 dark:text-white capitalize">
                  #{row.keyword}
                </td>
                {brands.map((brand) => (
                  <td key={brand} className="p-3 text-center text-slate-700 dark:text-slate-300">
                    {row[brand] || 0}
                  </td>
                ))}
                <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Key Insights:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Most common topic across all brands: <strong>#{comparison[0]?.keyword}</strong></li>
          <li>• Total unique topics identified: <strong>{comparison.length}</strong></li>
          <li>• Brands with most diverse topics: <strong>{brands[0]}</strong></li>
        </ul>
      </div>
    </div>
  );
}