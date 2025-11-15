// client/src/components/UI/ThemeToggle.jsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
    >
      <div
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 
          shadow-md transform transition-transform duration-300 ease-in-out
          flex items-center justify-center
          ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-blue-500" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
    </button>
  );
}