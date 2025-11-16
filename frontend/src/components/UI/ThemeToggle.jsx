// client/src/components/UI/ThemeToggle.jsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`
        relative w-14 h-8 rounded-full p-1 transition-all duration-500
        group overflow-hidden shadow-lg backdrop-blur-xl
        border-2 hover:shadow-xl hover:scale-105 active:scale-95
        ${theme === "dark"
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/60"
          : "bg-gradient-to-br from-slate-100 to-white border-slate-300/60"
        }
      `}
    >
      {/* Animated Background Glow */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500
          ${theme === "dark"
            ? "bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20"
            : "bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20"
          }
        `}
      />

      {/* Sliding Knob */}
      <div
        className={`
          relative w-full h-full rounded-full flex items-center transition-all duration-500 ease-out
          ${theme === "dark" ? "justify-start" : "justify-end"}
        `}
      >
        <div
          className={`
            relative w-6 h-6 rounded-full shadow-lg flex items-center justify-center
            transition-all duration-500 transform-gpu group-hover:scale-110
            ${theme === "dark"
              ? "bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50"
              : "bg-gradient-to-br from-white to-slate-100 border border-slate-300/60"
            }
          `}
        >
          {/* Sun Icon */}
          <Sun
            className={`
              absolute w-4 h-4 transition-all duration-500 ease-out
              ${theme === "dark"
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100 text-amber-500 drop-shadow-sm"
              }
            `}
          />
          
          {/* Moon Icon */}
          <Moon
            className={`
              absolute w-4 h-4 transition-all duration-500 ease-out
              ${theme === "dark"
                ? "rotate-0 scale-100 opacity-100 text-blue-400 drop-shadow-sm"
                : "rotate-90 scale-0 opacity-0"
              }
            `}
          />

          {/* Glow Effects */}
          <div
            className={`
              absolute inset-0 rounded-full transition-all duration-500
              ${theme === "dark"
                ? "bg-blue-500/10 blur-sm"
                : "bg-amber-500/10 blur-sm"
              }
            `}
          />
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {theme === "dark" ? (
          // Stars for dark mode
          <>
            <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse" />
            <div className="absolute bottom-2 right-3 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse delay-300" />
            <div className="absolute top-2 right-1 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse delay-500" />
          </>
        ) : (
          // Sun rays for light mode
          <>
            <div className="absolute top-1 left-3 w-0.5 h-0.5 bg-amber-400 rounded-full" />
            <div className="absolute bottom-1 right-2 w-0.5 h-0.5 bg-orange-400 rounded-full" />
          </>
        )}
      </div>

      {/* Hover Shine Effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className={`
            absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700
            bg-gradient-to-r from-transparent via-white/30 to-transparent
            -translate-x-full group-hover:translate-x-full
          `}
          style={{ transition: 'transform 0.7s ease-out, opacity 0.3s ease-out' }}
        />
      </div>

      {/* Border Glow Effect */}
      <div
        className={`
          absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500
          blur-sm -z-10
          ${theme === "dark"
            ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30"
            : "bg-gradient-to-r from-amber-400/30 to-orange-400/30"
          }
        `}
      />
    </button>
  );
}