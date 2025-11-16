import { TrendingUp, MessageCircle, ThumbsUp, AlertCircle, Sparkles, Zap, ArrowUpRight } from 'lucide-react';
import { useBrandStats } from '../../hooks/useBrandStats';
import { useRealtime } from '../../hooks/useRealtime';
import { StatCardSkeleton } from '../UI/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';

const stats = [
  { 
    key: 'total', 
    label: 'Total Mentions', 
    icon: MessageCircle, 
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    lightGlow: 'shadow-blue-500/10',
    darkGlow: 'shadow-blue-500/10',
    description: 'All mentions across platforms',
    prefix: '',
    suffix: ''
  },
  { 
    key: 'positive', 
    label: 'Positive', 
    icon: ThumbsUp, 
    gradient: 'from-emerald-500 via-teal-500 to-green-600',
    lightGlow: 'shadow-emerald-500/10',
    darkGlow: 'shadow-emerald-500/10',
    description: 'Positive sentiment mentions',
    prefix: '',
    suffix: ''
  },
  { 
    key: 'negative', 
    label: 'Negative', 
    icon: AlertCircle, 
    gradient: 'from-rose-500 via-pink-500 to-red-600',
    lightGlow: 'shadow-rose-500/10',
    darkGlow: 'shadow-rose-500/10',
    description: 'Negative sentiment mentions',
    prefix: '',
    suffix: ''
  },
  { 
    key: 'engagement', 
    label: 'Avg Engagement', 
    icon: TrendingUp, 
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    lightGlow: 'shadow-violet-500/10',
    darkGlow: 'shadow-violet-500/10',
    description: 'Average likes, shares & comments',
    prefix: '',
    suffix: '%'
  },
];

function AnimatedCounter({ value, duration = 1000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
}

export default function StatCard({ brand, isDragging = false, onDragStart, widgetKey = 'stats' }) {
  const { data, isLoading } = useBrandStats(brand);
  const { spike } = useRealtime(brand);
  const { theme } = useTheme();
  const dragHandleRef = useRef(null);

  const hasActiveSpike = spike?.detected === true;

  // Prevent hover effects when dragging
  const isInteractive = !isDragging;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const values = {
    total: data?.stats?.total || 0,
    positive: data?.stats?.sentiment?.positive || 0,
    negative: data?.stats?.sentiment?.negative || 0,
    engagement: Math.round(data?.stats?.avgEngagement || 0),
  };

  const positivePercentage = values.total > 0 ? Math.round((values.positive / values.total) * 100) : 0;
  const negativePercentage = values.total > 0 ? Math.round((values.negative / values.total) * 100) : 0;

  const handleDragStart = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (onDragStart) {
      onDragStart(e, widgetKey);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 transition-all duration-500">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = values[stat.key];
        const glowColor = theme === 'dark' ? stat.darkGlow : stat.lightGlow;
        
        const showPercentage = (stat.key === 'positive' || stat.key === 'negative') && values.total > 0;
        const percentage = stat.key === 'positive' ? positivePercentage : negativePercentage;

        const valueLength = value.toString().length;
        const getValueSize = () => {
          if (valueLength <= 4) return 'text-4xl';
          if (valueLength <= 6) return 'text-3xl';
          if (valueLength <= 8) return 'text-2xl';
          return 'text-xl';
        };

        return (
          <div
            key={stat.key}
            className={`
              group relative overflow-hidden rounded-2xl min-h-[160px]
              ${theme === 'dark' 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white/80 border-slate-200/60 backdrop-blur-xs'
              }
              border-2 shadow-xl ${isInteractive ? 'hover:shadow-2xl' : ''} ${glowColor}
              transition-all duration-500 ${isInteractive ? 'hover:-translate-y-2 hover:scale-[1.02]' : ''}
              ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
            `}
          >
            {/* Animated Gradient Background */}
            {isInteractive && (
              <div className={`
                absolute inset-0 bg-gradient-to-br ${stat.gradient}
                opacity-0 group-hover:opacity-5 transition-all duration-500
                animate-gradient-shift
              `} />
            )}

            {/* Premium Gradient Top Bar */}
            <div className={`
              absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.gradient}
              transition-all duration-500 ${isInteractive ? 'group-hover:h-2' : ''}
            `}>
              {isInteractive && (
                <div className={`absolute inset-0 ${
                  theme === 'dark' ? 'bg-white/30' : 'bg-white/50'
                } animate-shimmer`} />
              )}
            </div>

            {/* Floating Particles Effect */}
            {isInteractive && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className={`absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-float-slow ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-slate-400/30'
                }`} />
                <div className={`absolute top-3/4 right-1/3 w-1.5 h-1.5 rounded-full animate-float-slower ${
                  theme === 'dark' ? 'bg-white/15' : 'bg-slate-400/25'
                }`} />
                <div className={`absolute bottom-1/3 left-2/3 w-1 h-1 rounded-full animate-float-fast ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-slate-400/20'
                }`} />
              </div>
            )}

            <div className="relative z-10 flex flex-col h-full p-5">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-bold tracking-tight text-sm mb-1
                    ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}
                  `}>
                    {stat.label}
                  </h3>
                  <p className={`
                    text-xs leading-relaxed
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                  `}>
                    {stat.description}
                  </p>
                </div>

                {/* Premium Icon with Glow */}
                <div className="relative flex-shrink-0 ml-3">
                  {isInteractive && (
                    <div className={`
                      absolute inset-0 bg-gradient-to-br ${stat.gradient} blur-xs
                      ${theme === 'dark' ? 'opacity-50' : 'opacity-30'}
                      group-hover:opacity-80 transition-opacity duration-500
                    `} />
                  )}
                  <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center
                    bg-gradient-to-br ${stat.gradient} 
                    transform ${isInteractive ? 'group-hover:scale-110 group-hover:rotate-6' : ''} transition-all duration-500
                    border border-white/20
                  `}>
                    <Icon className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Value Section */}
              <div className="mt-auto space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className={`
                    font-black tracking-tighter leading-none
                    ${getValueSize()}
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                    bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent
                    ${isInteractive ? 'group-hover:scale-105' : ''} transition-transform duration-300
                  `}>
                    <AnimatedCounter 
                      value={value} 
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                    />
                  </div>

                  {/* Sparkle Icon for High Values */}
                  {value > 50 && isInteractive && (
                    <Sparkles className={`
                      w-5 h-5 text-amber-500 animate-pulse
                      ${theme === 'dark' ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'}
                    `} />
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Percentage Badge */}
                  {showPercentage && (
                    <div className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border
                      ${stat.key === 'positive'
                        ? theme === 'dark' 
                          ? 'bg-emerald-900/30 border-emerald-800/50' 
                          : 'bg-emerald-100 border-emerald-200'
                        : theme === 'dark'
                          ? 'bg-rose-900/30 border-rose-800/50'
                          : 'bg-rose-100 border-rose-200'
                      }
                    `}>
                      <div className={`
                        w-2 h-2 rounded-full animate-pulse
                        ${stat.key === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'}
                      `} />
                      <span className={`
                        text-xs font-bold
                        ${stat.key === 'positive'
                          ? theme === 'dark'
                            ? 'text-emerald-300'
                            : 'text-emerald-700'
                          : theme === 'dark'
                            ? 'text-rose-300'
                            : 'text-rose-700'
                        }
                      `}>
                        {percentage}%
                      </span>
                    </div>
                  )}

                  {/* Trend Indicator with Animation */}
                  {stat.key === 'total' && values.total > 0 && isInteractive && (
                    <div className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border
                      ${theme === 'dark' 
                        ? 'bg-emerald-900/30 border-emerald-800/50' 
                        : 'bg-emerald-100 border-emerald-200'
                      }
                    `}>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        +12%
                      </span>
                    </div>
                  )}

                  {/* Premium Badge for Engagement */}
                  {stat.key === 'engagement' && value > 75 && isInteractive && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg border border-amber-300/50">
                      <Zap className="w-3 h-3" />
                      Hot
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Hover Overlay */}
            {isInteractive && (
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500
                bg-gradient-to-br ${stat.gradient} mix-blend-overlay pointer-events-none
                ${theme === 'dark' ? 'opacity-20' : 'opacity-10'}
              `} />
            )}

            {/* Glow Effect */}
            {isInteractive && (
              <div className={`
                absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-60 blur-xl
                transition-all duration-700 pointer-events-none
                bg-gradient-to-br ${stat.gradient}
                ${theme === 'dark' ? 'opacity-60' : 'opacity-40'}
              `} />
            )}

            {/* Border Shine Effect */}
            {isInteractive && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000
                  bg-gradient-to-r from-transparent via-white/30 to-transparent
                  animate-border-shine
                  ${theme === 'dark' ? 'via-white/30' : 'via-slate-200/50'}
                `} />
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(15px); }
        }
        @keyframes border-shine {
          0% { transform: translateX(-100%) skewX(-45deg); }
          100% { transform: translateX(200%) skewX(-45deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 8s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
        .animate-border-shine {
          animation: border-shine 3s ease-in-out infinite;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
      `}</style>
    </div>
  );
}