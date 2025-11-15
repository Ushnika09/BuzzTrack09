// client/src/components/Analytics/TimeframeSelector.jsx
import { Calendar } from 'lucide-react';

const TIMEFRAMES = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function TimeframeSelector({ value, onChange }) {
  return (
    <div className="relative inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
      <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-slate-900 dark:text-white font-medium text-sm focus:outline-none cursor-pointer"
      >
        {TIMEFRAMES.map((tf) => (
          <option key={tf.value} value={tf.value}>
            {tf.label}
          </option>
        ))}
      </select>
    </div>
  );
}