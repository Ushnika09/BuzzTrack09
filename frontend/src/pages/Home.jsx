// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Plus, GripVertical, Sparkles, Zap, TrendingUp, Users, MessageCircle, Target } from 'lucide-react';
import { useBrands } from '../hooks/useBrands';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

import StatCard from '../components/Dashboard/StatCard';
import MentionFeed from '../components/Dashboard/MentionFeed';
import SentimentChart from '../components/Dashboard/SentimentChart';
import VolumeChart from '../components/Dashboard/VolumeChart';
import SourceBreakdown from '../components/Dashboard/SourceBreakdown';
import SpikeAlert from '../components/Dashboard/SpikeAlert';
import AddBrandModal from '../components/Modals/AddBrandModal';
import EmptyState from '../components/UI/EmptyState';
import WebSocketDebug from '../components/Debug/WebSocketDebug';

const DEFAULT_WIDGET_ORDER = ['stats', 'spike', 'sentiment', 'volume', 'sources', 'feed'];

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('dashboard-widget-order');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGET_ORDER;
  });
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const { theme } = useTheme();
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { toast } = useToast();

  const brands = brandsData?.brands || [];

  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  useEffect(() => {
    localStorage.setItem('dashboard-widget-order', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const handleDragStart = (e, widget) => {
    setDraggedWidget(widget);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('widget', widget);

    const draggedEl = e.currentTarget;
    draggedEl.style.opacity = '0.5';
    draggedEl.style.transform = 'scale(0.98)';
    draggedEl.style.zIndex = '50';
  };

  const handleDragEnd = (e) => {
    setDraggedWidget(null);
    setIsDragging(false);
    document.querySelectorAll('.widget-item').forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.zIndex = '';
      el.classList.remove('drag-over');
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetWidget) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const dragged = e.dataTransfer.getData('widget');
    if (!dragged || dragged === targetWidget) return;

    const newOrder = widgetOrder.filter(w => w !== dragged);
    const targetIdx = newOrder.indexOf(targetWidget);
    newOrder.splice(targetIdx, 0, dragged);

    setWidgetOrder(newOrder);
    toast.success('Dashboard layout updated');
  };

  // Theme classes
  const bgClass = theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-purple-50/20';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';

  // Widgets with data-tour attributes - UPDATED StatCard with proper props
  const widgets = {
    stats: (
      <div data-tour="stats">
        <StatCard 
          brand={selectedBrand} 
          isDragging={draggedWidget === 'stats'}
          onDragStart={(e) => handleDragStart(e, 'stats')}
          widgetKey="stats"
        />
      </div>
    ),
    spike: (
      <div data-tour="spike">
        <SpikeAlert brand={selectedBrand} />
      </div>
    ),
    sentiment: (
      <div data-tour="sentiment">
        <SentimentChart brand={selectedBrand} />
      </div>
    ),
    volume: (
      <div data-tour="volume">
        <VolumeChart brand={selectedBrand} />
      </div>
    ),
    sources: (
      <div data-tour="sources">
        <SourceBreakdown brand={selectedBrand} />
      </div>
    ),
    feed: (
      <div data-tour="feed">
        <MentionFeed brand={selectedBrand} />
      </div>
    ),
  };

  if (brandsLoading) {
    return (
      <div className={`min-h-screen ${bgClass} p-6 lg:p-8 transition-all duration-500`}>
        <div className="space-y-8">
          {/* Loading Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div className="h-4 w-64 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-40 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          </div>

          {/* Loading Brand Pills */}
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 w-32 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></div>
            ))}
          </div>

          {/* Loading Widgets */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-96 ${cardBg} rounded-2xl border ${borderClass} animate-pulse`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <>
        <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
          <EmptyState 
            type="noBrands" 
            action={() => setShowAddModal(true)} 
            actionLabel="Add Your First Brand" 
          />
        </div>
        <AddBrandModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      </>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500`}>
      <div className="p-6 lg:p-8">
        <div className="space-y-8">

          {/* Enhanced Premium Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-purple-600
                shadow-2xl shadow-blue-500/25
                transition-all duration-500 hover:scale-105
              `}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className={`mt-2 ${mutedText} flex items-center gap-2`}>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Real-time insights for <span className="font-semibold text-blue-500">{selectedBrand}</span>
                </p>
              </div>
            </div>
            
            {/* Enhanced Add Brand Button */}
            <button
              data-tour="add-brand"
              onClick={() => setShowAddModal(true)}
              className={`
                group flex items-center gap-2.5 px-6 py-3.5 font-medium rounded-xl
                shadow-lg transition-all duration-300 hover:scale-105 active:scale-95
                bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                text-white shadow-blue-600/20 hover:shadow-xl
              `}
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Add Brand
            </button>
          </div>

          {/* Enhanced Brand Pills */}
          <div 
            data-tour="brand-pills"
            className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
          >
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`
                  group relative px-6 py-3.5 rounded-full font-medium flex items-center gap-2.5 border-2 transition-all duration-300 min-w-max
                  ${selectedBrand === brand
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xs border-blue-600'
                    : `${cardBg} border ${borderClass} ${mutedText} hover:border-blue-300 dark:hover:border-blue-700 hover:scale-102`
                  }
                `}
              >
                <div className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${selectedBrand === brand 
                    ? 'bg-white scale-110' 
                    : 'bg-emerald-500 animate-pulse'
                  }
                `} />
                <span className="font-semibold">{brand}</span>
                
                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${selectedBrand === brand 
                    ? 'bg-blue-700' 
                    : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                  }
                  -z-10
                `} />
              </button>
            ))}
          </div>

          {/* Drag & Drop Widget Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {widgetOrder.map((widgetKey) => (
              <div
                key={widgetKey}
                draggable
                onDragStart={(e) => handleDragStart(e, widgetKey)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, widgetKey)}
                className={`
                  widget-item relative group rounded-2xl overflow-hidden
                  transition-all duration-300
                  ${widgetKey === 'feed' ? 'xl:col-span-2' : ''}
                  ${draggedWidget === widgetKey ? 'opacity-50 scale-98' : ''}
                  drag-over:ring-4 drag-over:ring-blue-500/40
                  drag-over:bg-gradient-to-br drag-over:from-blue-500/5 drag-over:to-purple-500/5
                `}
              >
                {/* Enhanced Floating Drag Handle */}
                <div className={`
                  absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 
                  transition-all duration-300 p-2 rounded-xl backdrop-blur-lg border
                  cursor-grab active:cursor-grabbing
                  ${theme === 'dark' 
                    ? 'bg-slate-700/80 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white' 
                    : 'bg-white/80 border-slate-300 text-slate-600 hover:bg-white hover:text-slate-900'
                  }
                  shadow-lg hover:shadow-xl hover:scale-110
                `}>
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Subtle drop indicator */}
                <div className={`
                  absolute inset-0 bg-gradient-to-t from-blue-500/10 via-purple-500/5 to-transparent 
                  opacity-0 drag-over:opacity-100 transition-opacity duration-300 pointer-events-none
                  rounded-2xl
                `} />

                {/* Widget Content */}
                <div className="h-full">
                  {widgets[widgetKey]}
                </div>
              </div>
            ))}
          </div>

          {/* Drag & Drop Helper Text */}
          {isDragging && (
            <div className={`
              fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl
              backdrop-blur-lg border text-sm font-medium shadow-2xl
              ${theme === 'dark' 
                ? 'bg-slate-800/90 border-slate-700 text-slate-200' 
                : 'bg-white/90 border-slate-200 text-slate-700'
              }
              animate-bounce
            `}>
              🎯 Drop to rearrange widgets
            </div>
          )}

        </div>
      </div>

      <AddBrandModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      {import.meta.env.DEV && <WebSocketDebug brand={selectedBrand} />}
    </div>
  );
}