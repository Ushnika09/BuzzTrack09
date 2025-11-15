// client/src/components/Filters/SearchBar.jsx
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search mentions..." }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}