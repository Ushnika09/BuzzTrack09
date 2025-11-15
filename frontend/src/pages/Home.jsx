// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Plus, GripVertical } from 'lucide-react';
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
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('widget', widget);

    // Make dragged item semi-transparent + floating
    const draggedEl = e.currentTarget;
    draggedEl.style.opacity = '0.5';
    draggedEl.style.transform = 'scale(0.98)';
    draggedEl.style.zIndex = '50';
  };

  const handleDragEnd = (e) => {
    setDraggedWidget(null);
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
    toast.success('Dashboard updated');
  };

  const widgets = {
    stats: <StatCard brand={selectedBrand} />,
    spike: <SpikeAlert brand={selectedBrand} />,
    sentiment: <SentimentChart brand={selectedBrand} />,
    volume: <VolumeChart brand={selectedBrand} />,
    sources: <SourceBreakdown brand={selectedBrand} />,
    feed: <MentionFeed brand={selectedBrand} />,
  };

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';

  if (brandsLoading) {
    return (
      <div className={`min-h-screen ${bgClass} p-6 lg:p-8`}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <>
        <EmptyState type="noBrands" action={() => setShowAddModal(true)} actionLabel="Add Your First Brand" />
        <AddBrandModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      </>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      <div className="p-6 lg:p-8">
        <div className="space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className={`mt-2 ${mutedText}`}>
                Real-time insights for <span className="font-semibold text-blue-500">{selectedBrand}</span>
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add Brand
            </button>
          </div>

          {/* Brand Pills */}
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-6 py-3 rounded-full font-medium flex items-center gap-2.5 border transition-all ${
                  selectedBrand === brand
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : `${cardBg} border ${borderClass} ${mutedText} hover:border-slate-400`
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {brand}
              </button>
            ))}
          </div>

          {/* Transparent Drag & Drop Grid */}
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
                  drag-over:ring-4 drag-over:ring-blue-500 drag-over:ring-opacity-40
                  drag-over:bg-blue-500/5
                `}
              >
                {/* Floating Drag Handle */}
                <div className={`absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${cardBg} border ${borderClass} shadow-lg backdrop-blur`}>
                  <GripVertical className="w-5 h-5 text-slate-500" />
                </div>

                {/* Subtle drop indicator */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 drag-over:opacity-100 transition-opacity pointer-events-none" />

                {/* Widget Content */}
                <div className="h-full">
                  {widgets[widgetKey]}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <AddBrandModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      {import.meta.env.DEV && <WebSocketDebug brand={selectedBrand} />}
    </div>
  );
}