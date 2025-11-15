// client/src/components/Filters/SourceFilter.jsx
export default function SourceFilter({ value, onChange }) {
  const options = [
    { value: '', label: 'All Sources' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'news', label: 'News' },
    { value: 'twitter', label: 'Twitter' }
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}