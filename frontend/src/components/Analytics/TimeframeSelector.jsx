// client/src/components/Analytics/TimeframeSelector.jsx
import { Calendar, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const TIMEFRAMES = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function TimeframeSelector({ value, onChange }) {
  const { theme } = useTheme();
  
  const selectedLabel = TIMEFRAMES.find(tf => tf.value === value)?.label;

  return (
    <div className={`
      relative inline-flex items-center gap-3 rounded-2xl px-4 py-3
      backdrop-blur-sm border transition-all duration-300
      ${theme === 'dark'
        ? 'bg-slate-700/50 border-slate-600/50 text-white'
        : 'bg-white/80 border-slate-200/50 text-slate-700'
      }
      shadow-lg hover:shadow-xl hover:scale-105
    `}>
      <Calendar className="w-4 h-4" />
      
      {/* Custom Select Container */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            appearance-none bg-transparent font-medium text-sm focus:outline-none 
            cursor-pointer pr-8 py-1
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}
        >
          {TIMEFRAMES.map((tf) => (
            <option 
              key={tf.value} 
              value={tf.value}
              className={`
                ${theme === 'dark' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-slate-900'
                }
              `}
            >
              {tf.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron */}
        <ChevronDown className={`
          absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
          ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
        `} />
      </div>
    </div>
  );
}