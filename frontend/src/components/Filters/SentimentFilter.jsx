// client/src/components/Filters/SentimentFilter.jsx
export default function SentimentFilter({ value, onChange }) {
  const options = [
    { value: '', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
    { value: 'neutral', label: 'Neutral' }
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