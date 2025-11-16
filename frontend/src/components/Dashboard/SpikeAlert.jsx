import { useState, useEffect, useRef } from 'react';
import { TrendingUp, X, ExternalLink, AlertCircle, Zap, Activity, Eye, Flame, Rocket, Sparkles, Target } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

// Animated counter component
function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        completedRef.current = true;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count}%</>;
}

export default function SpikeAlert({ brand }) {
  const { spike, clearSpike } = useRealtime(brand);
  const { toast } = useToast();
  const { theme } = useTheme();
  const [currentSpike, setCurrentSpike] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const spikeIdRef = useRef(new Set());
  const hasShownToastRef = useRef(false);

  // Confetti + sound celebration
  const triggerCelebration = (increase) => {
    new Audio('/sounds/spike-chime.mp3').play().catch(() => {});

    if (increase >= 100 && typeof confetti !== 'undefined') {
      confetti({
        particleCount: increase >= 300 ? 300 : increase >= 200 ? 200 : 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#86efac', '#a7f3d0'],
        scalar: increase >= 300 ? 1.5 : 1.2,
      });
    }
  };

  useEffect(() => {
    if (spike && spike.detected) {
      const spikeId = `${spike.brand}-${spike.timestamp}`;
      
      if (!spikeIdRef.current.has(spikeId)) {
        spikeIdRef.current.add(spikeId);
        hasShownToastRef.current = false;
        
        setCurrentSpike({ ...spike, id: spikeId });
        setIsVisible(true);

        triggerCelebration(spike.increase);

        if (!hasShownToastRef.current) {
          hasShownToastRef.current = true;
          
          const getToastMessage = (inc) => {
            if (inc >= 300) return `🔥 MEGA SPIKE DETECTED! ${spike.brand} +${inc}%`;
            if (inc >= 200) return `🚀 HUGE SPIKE DETECTED! ${spike.brand} +${inc}%`;
            if (inc >= 100) return `⚡ BIG SPIKE DETECTED! ${spike.brand} +${inc}%`;
            return `📈 Spike Detected! ${spike.brand} +${inc}%`;
          };

          toast.success(getToastMessage(spike.increase), {
            duration: 8000,
            icon: <TrendingUp className="w-5 h-5" />,
          });
        }

        setTimeout(() => {
          document.querySelector('[data-tour="spike"]')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);

        setTimeout(() => {
          removeSpike();
        }, 20000);
      }
    }
  }, [spike?.detected, spike?.timestamp]);

  const removeSpike = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentSpike(null);
      clearSpike();
      spikeIdRef.current.clear();
      hasShownToastRef.current = false;
    }, 400);
  };

  const getIntensity = (pct) => {
    if (pct >= 300) return { 
      bg: 'from-red-500/20 via-rose-500/15 to-pink-500/20', 
      border: 'border-red-500/50', 
      accent: 'from-red-500 via-rose-500 to-pink-600', 
      text: 'text-red-600 dark:text-red-400',
      glow: 'shadow-red-500/40',
      ring: 'ring-red-500/30',
      label: 'MEGA SPIKE',
      emoji: '🔥',
      icon: Flame,
      badgeBg: 'bg-red-500'
    };
    if (pct >= 200) return { 
      bg: 'from-orange-500/20 via-amber-500/15 to-yellow-500/20', 
      border: 'border-orange-500/50', 
      accent: 'from-orange-500 via-amber-500 to-yellow-500', 
      text: 'text-orange-600 dark:text-orange-400',
      glow: 'shadow-orange-500/40',
      ring: 'ring-orange-500/30',
      label: 'HUGE SPIKE',
      emoji: '🚀',
      icon: Rocket,
      badgeBg: 'bg-orange-500'
    };
    if (pct >= 100) return { 
      bg: 'from-amber-500/20 via-yellow-500/15 to-lime-500/20', 
      border: 'border-amber-500/50', 
      accent: 'from-amber-500 via-yellow-500 to-lime-500', 
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-amber-500/40',
      ring: 'ring-amber-500/30',
      label: 'BIG SPIKE',
      emoji: '⚡',
      icon: Zap,
      badgeBg: 'bg-amber-500'
    };
    return { 
      bg: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/20', 
      border: 'border-emerald-500/50', 
      accent: 'from-emerald-500 via-teal-500 to-cyan-500', 
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-emerald-500/40',
      ring: 'ring-emerald-500/30',
      label: 'SPIKE DETECTED',
      emoji: '📈',
      icon: TrendingUp,
      badgeBg: 'bg-emerald-500'
    };
  };

  if (!currentSpike || !isVisible) return null;

  const s = currentSpike;
  const intensity = getIntensity(s.increase);
  const isNew = Date.now() - new Date(s.timestamp).getTime() < 5000;
  const Icon = intensity.icon;

  return (
    <div className={`
      relative overflow-hidden rounded-3xl shadow-2xl border-2 ${intensity.border}
      backdrop-blur-xl transition-all duration-500
      ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'}
      ${isVisible ? 'animate-in slide-in-from-top-8 fade-in duration-500' : 'animate-out slide-out-to-top-8 fade-out duration-300'}
      ${isNew ? `${intensity.ring} ring-8 animate-pulse` : ''}
      hover:scale-[1.01] hover:${intensity.glow} hover:shadow-3xl
    `}>
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${intensity.bg} ${isNew ? 'animate-pulse' : ''}`}>
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-white/60'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
      </div>

      {/* Floating particles */}
      {isNew && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float-slow" />
          <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-float-slower" />
          <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-white/20 rounded-full animate-float-fast" />
        </div>
      )}

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Premium animated icon */}
            <div className="relative flex-shrink-0">
              <div className={`
                absolute inset-0 bg-gradient-to-br ${intensity.accent} blur-xl opacity-60
                ${isNew ? 'animate-pulse' : ''}
              `} />
              <div className={`
                relative w-16 h-16 rounded-2xl flex items-center justify-center
                bg-gradient-to-br ${intensity.accent} shadow-2xl ${intensity.glow}
                transform ${isNew ? 'animate-bounce' : 'hover:scale-110 hover:rotate-12'}
                transition-all duration-500
              `}>
                <Icon className={`w-9 h-9 text-white drop-shadow-lg ${isNew ? 'animate-pulse' : ''}`} />
                {isNew && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Header with premium badge */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className={`
                  relative px-4 py-1.5 rounded-full font-black text-sm
                  bg-gradient-to-r ${intensity.accent} text-white shadow-lg
                  ${isNew ? 'animate-pulse' : ''}
                  overflow-hidden
                `}>
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-base">{intensity.emoji}</span>
                    {intensity.label}
                  </span>
                </div>
                
                {isNew && (
                  <div className={`
                    flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                    ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}
                    border ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}
                  `}>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Main message with animated counter */}
              <h3 className={`
                text-2xl font-black mb-4 leading-tight
              `}>
                <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {s.brand}
                </span>
                {' '}
                <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  mentions surged by
                </span>
                {' '}
                <span className={`inline-flex items-center gap-2`}>
                  <span className={`text-4xl font-black ${intensity.text}`}>
                    +<AnimatedCounter value={s.increase} />
                  </span>
                  <span className="text-3xl">{intensity.emoji}</span>
                </span>
              </h3>

              {/* Premium stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { 
                    label: 'Current', 
                    value: s.currentCount.toLocaleString(), 
                    icon: Eye, 
                    color: 'from-blue-500 to-cyan-500',
                    textColor: 'text-blue-600 dark:text-blue-400'
                  },
                  { 
                    label: 'Previous', 
                    value: s.previousCount.toLocaleString(), 
                    icon: Activity, 
                    color: 'from-slate-500 to-gray-500',
                    textColor: 'text-slate-600 dark:text-slate-400'
                  },
                  { 
                    label: 'Ratio', 
                    value: `${s.spikeRatio}x`, 
                    icon: Target, 
                    color: 'from-yellow-500 to-orange-500',
                    textColor: 'text-yellow-600 dark:text-yellow-400'
                  },
                  { 
                    label: 'Sentiment', 
                    value: s.sentiment?.dominant || 'Mixed', 
                    icon: AlertCircle, 
                    color: 'from-purple-500 to-pink-500',
                    textColor: 'text-purple-600 dark:text-purple-400'
                  },
                ].map(stat => {
                  const StatIcon = stat.icon;
                  return (
                    <div 
                      key={stat.label} 
                      className={`
                        group relative overflow-hidden rounded-xl p-3.5
                        ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'}
                        backdrop-blur-sm border
                        ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
                        hover:scale-105 hover:shadow-lg transition-all duration-300
                      `}
                    >
                      <div className={`
                        absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity
                        bg-gradient-to-br ${stat.color}
                      `} />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`
                            w-7 h-7 rounded-lg flex items-center justify-center
                            bg-gradient-to-br ${stat.color} shadow-md
                          `}>
                            <StatIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className={`
                            text-xs font-bold uppercase tracking-wide
                            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                          `}>
                            {stat.label}
                          </div>
                        </div>
                        <div className={`
                          text-xl font-black
                          ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                        `}>
                          {stat.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Toggle details button */}
              {s.topMentions?.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl
                    ${theme === 'dark' ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100/80 hover:bg-slate-100'}
                    border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
                    transition-all duration-300 group mb-3
                  `}
                >
                  <span className={`
                    text-sm font-semibold
                    ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}
                  `}>
                    {showDetails ? 'Hide' : 'Show'} Top Driving Mentions ({s.topMentions.length})
                  </span>
                  <Sparkles className={`
                    w-4 h-4 transition-transform duration-300
                    ${showDetails ? 'rotate-180' : ''}
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `} />
                </button>
              )}

              {/* Premium top mentions - collapsible */}
              {showDetails && s.topMentions?.length > 0 && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  {s.topMentions.slice(0, 3).map((m, idx) => (
                    <a 
                      key={m.id} 
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`
                        group flex items-center gap-3 p-4 rounded-xl
                        ${theme === 'dark' ? 'bg-slate-800/90 hover:bg-slate-800' : 'bg-white/95 hover:bg-white'}
                        border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
                        hover:scale-[1.02] hover:shadow-lg transition-all duration-300
                      `}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        bg-gradient-to-br ${intensity.accent} shadow-md
                      `}>
                        <span className="text-white font-bold text-sm">{idx + 1}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`
                          font-semibold line-clamp-2 text-sm leading-snug mb-1
                          ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                        `}>
                          {m.content}
                        </p>
                        <div className={`
                          flex items-center gap-2 text-xs
                          ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                        `}>
                          <span className="capitalize font-medium">{m.source}</span>
                          <span>•</span>
                          <span className={`
                            px-2 py-0.5 rounded-full capitalize font-medium
                            ${m.sentiment === 'positive' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : m.sentiment === 'negative'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }
                          `}>
                            {m.sentiment}
                          </span>
                        </div>
                      </div>
                      
                      <ExternalLink className={`
                        w-5 h-5 flex-shrink-0 transition-all duration-300
                        ${theme === 'dark' ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600'}
                        opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0
                      `} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Premium close button */}
          <button
            onClick={removeSpike}
            className={`
              flex-shrink-0 p-3 rounded-xl transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-slate-800/80 hover:bg-red-900/50 text-slate-400 hover:text-red-400' 
                : 'bg-white/80 hover:bg-red-50 text-slate-600 hover:text-red-600'
              }
              border ${theme === 'dark' ? 'border-slate-700 hover:border-red-800' : 'border-slate-200 hover:border-red-200'}
              shadow-sm hover:shadow-lg hover:scale-110
            `}
            title="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Premium animated bottom accent bar */}
      <div className={`relative h-2 bg-gradient-to-r ${intensity.accent} overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        {isNew && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
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
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
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
      `}</style>
    </div>
  );
}