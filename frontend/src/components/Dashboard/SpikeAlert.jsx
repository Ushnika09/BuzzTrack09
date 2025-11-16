// client/src/components/Dashboard/SpikeAlert.jsx
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, X, ExternalLink, AlertCircle, Zap, Activity, Eye } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useToast } from '../../context/ToastContext';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';

export default function SpikeAlert({ brand }) {
  const { spike, clearSpike } = useRealtime(brand);
  const { toast } = useToast();
  const [currentSpike, setCurrentSpike] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const spikeIdRef = useRef(new Set());

  // Enhanced confetti + sound on spike
  const triggerCelebration = (increase) => {
    // Multi-layered sound effect
    const playSound = (file) => {
      new Audio(file).play().catch(() => {});
    };

    // Different sounds for different spike levels
    if (increase >= 300) {
      playSound('/sounds/mega-spike.mp3');
      // Epic confetti burst
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      (function frame() {
        confetti({
          particleCount: 7,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: colors,
          scalar: randomInRange(1.2, 2),
          gravity: randomInRange(0.4, 0.6),
          drift: randomInRange(-0.4, 0.4),
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      }());
      
    } else if (increase >= 200) {
      playSound('/sounds/big-spike.mp3');
      // Fireworks style
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fb923c', '#fdba74', '#fbbf24', '#fcd34d'],
        scalar: 1.4,
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

    } else if (increase >= 100) {
      playSound('/sounds/spike-chime.mp3');
      // Cannon blast
      const colors = ['#10b981', '#34d399', '#6ee7b7', '#86efac', '#a7f3d0'];
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        scalar: 1.3,
        gravity: 0.8,
        drift: 0,
        ticks: 200,
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: colors,
          scalar: 1.1,
        });
      }, 200);

    } else {
      playSound('/sounds/spike-chime.mp3');
      // Gentle celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
        scalar: 1,
        gravity: 1,
      });
    }
  };

  useEffect(() => {
    if (spike && spike.detected) {
      const spikeId = `${spike.brand}-${spike.timestamp}`;
      
      // Only process if this is a new spike
      if (!spikeIdRef.current.has(spikeId)) {
        spikeIdRef.current.add(spikeId);
        
        // Set the new spike and show it
        setCurrentSpike({ ...spike, id: spikeId });
        setIsVisible(true);

        // Celebration
        triggerCelebration(spike.increase);

        // Enhanced toast
        const getToastMessage = (inc) => {
          if (inc >= 300) return `🔥 MEGA SPIKE for ${spike.brand}! +${inc}%`;
          if (inc >= 200) return `🚀 HUGE SPIKE for ${spike.brand}! +${inc}%`;
          if (inc >= 100) return `⚡ BIG SPIKE for ${spike.brand}! +${inc}%`;
          return `📈 Spike for ${spike.brand}! +${inc}%`;
        };

        toast.success(getToastMessage(spike.increase), {
          duration: 8000,
          icon: <TrendingUp className="w-5 h-5" />,
        });

        // Auto-scroll to spike card
        setTimeout(() => {
          document.querySelector('[data-tour="spike"]')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          removeSpike();
        }, 3000);
      }
    }
  }, [spike, toast]);

  const removeSpike = () => {
    setIsVisible(false);
    // Wait for fade-out animation before removing
    setTimeout(() => {
      setCurrentSpike(null);
      clearSpike();
    }, 400);
  };

  // Enhanced intensity colors with more vibrant palettes
  const getIntensity = (pct) => {
    if (pct >= 300) return { 
      bg: 'from-red-500/25 to-rose-600/25', 
      border: 'border-red-500/60', 
      ring: 'ring-red-500/40', 
      accent: 'from-red-500 via-rose-500 to-pink-600', 
      text: 'text-red-600 dark:text-red-400',
      glow: 'shadow-red-500/50',
      label: '🔥 MEGA',
      emoji: '🔥'
    };
    if (pct >= 200) return { 
      bg: 'from-orange-500/25 to-amber-500/25', 
      border: 'border-orange-500/60', 
      ring: 'ring-orange-500/40', 
      accent: 'from-orange-500 via-amber-500 to-yellow-500', 
      text: 'text-orange-600 dark:text-orange-400',
      glow: 'shadow-orange-500/50',
      label: '🚀 HUGE',
      emoji: '🚀'
    };
    if (pct >= 100) return { 
      bg: 'from-amber-500/25 to-yellow-500/25', 
      border: 'border-amber-500/60', 
      ring: 'ring-amber-500/40', 
      accent: 'from-amber-500 via-yellow-500 to-lime-500', 
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-amber-500/50',
      label: '⚡ BIG',
      emoji: '⚡'
    };
    return { 
      bg: 'from-emerald-500/25 to-teal-500/25', 
      border: 'border-emerald-500/60', 
      ring: 'ring-emerald-500/40', 
      accent: 'from-emerald-500 via-teal-500 to-cyan-500', 
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-emerald-500/50',
      label: '📈 SPIKE',
      emoji: '📈'
    };
  };

  if (!currentSpike || !isVisible) return null;

  const s = currentSpike;
  const intensity = getIntensity(s.increase);
  const isNew = Date.now() - s.timestamp < 5000;

  return (
    <div className={`
      relative overflow-hidden rounded-3xl shadow-2xl border-2 ${intensity.border} 
      bg-gradient-to-br ${intensity.bg} backdrop-blur-xl
      transition-all duration-400
      ${isVisible ? 'animate-in slide-in-from-top-8 fade-in duration-300' : 'animate-out slide-out-to-top-8 fade-out duration-200'}
      ${isNew ? `animate-pulse ${intensity.ring} ring-8` : ''}
      hover:scale-[1.01] hover:${intensity.glow} hover:shadow-3xl
    `}>
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${intensity.accent} opacity-15 ${isNew ? 'animate-pulse' : ''}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
      </div>

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Animated icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br ${intensity.accent} ${intensity.glow} ${isNew ? 'animate-bounce' : ''}`}>
              <TrendingUp className={`w-8 h-8 text-white ${isNew ? 'animate-pulse' : ''}`} />
            </div>

            <div className="flex-1">
              {/* Header with badge */}
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${intensity.accent} text-white shadow-lg`}>
                  {intensity.label}
                </span>
                <h3 className={`text-xl font-black ${intensity.text}`}>
                  Conversation Spike!
                </h3>
              </div>

              {/* Main message with animated number */}
              <p className="text-base font-bold mb-4">
                <span className="text-slate-900 dark:text-white">{s.brand}</span> mentions surged by{' '}
                <span className={`inline-flex items-center gap-1`}>
                  <CountUp
                    start={0}
                    end={s.increase}
                    duration={2}
                    suffix="%"
                    className={`text-3xl font-black ${intensity.text}`}
                  />
                  <span className="text-2xl">{intensity.emoji}</span>
                </span>
              </p>

              {/* Compact stats grid with icons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Now', value: s.currentCount.toLocaleString(), icon: Eye, color: 'text-blue-500' },
                  { label: 'Before', value: s.previousCount.toLocaleString(), icon: Activity, color: 'text-slate-500' },
                  { label: 'Multiplier', value: `${s.spikeRatio}x`, icon: Zap, color: 'text-yellow-500' },
                  { label: 'Tone', value: s.sentiment?.dominant || 'Mixed', icon: AlertCircle, color: 'text-purple-500' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white/90 dark:bg-slate-800/80 rounded-xl p-3 backdrop-blur-sm hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Compact top mentions */}
              {s.topMentions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Top drivers:</p>
                  {s.topMentions.slice(0, 2).map(m => (
                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/95 dark:bg-slate-800/90 rounded-xl hover:scale-[1.02] transition-all group shadow-sm hover:shadow-md">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1 text-sm text-slate-900 dark:text-white">{m.content}</p>
                        <div className="text-xs text-slate-500 mt-0.5">{m.source} • {m.sentiment}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={removeSpike}
            className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-800/95 hover:bg-red-50 dark:hover:bg-red-900/50 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-all hover:scale-110 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Animated bottom stripe */}
      <div className={`h-1.5 bg-gradient-to-r ${intensity.accent} ${isNew ? 'animate-pulse' : ''}`}>
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}