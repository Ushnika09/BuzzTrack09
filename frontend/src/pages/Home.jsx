// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Plus, GripVertical } from 'lucide-react';
import { useBrands } from '../hooks/useBrands';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/Dashboard/StatCard';
import MentionFeed from '../components/Dashboard/MentionFeed';
import SentimentChart from '../components/Dashboard/SentimentChart';
import VolumeChart from '../components/Dashboard/VolumeChart';
import SourceBreakdown from '../components/Dashboard/SourceBreakdown';
import SpikeAlert from '../components/Dashboard/SpikeAlert';
import TopicCloud from '../components/Dashboard/TopicCloud';
import TrendingTopics from '../components/Dashboard/TrendingTopics';
import AddBrandModal from '../components/Modals/AddBrandModal';
import EmptyState from '../components/UI/EmptyState';
import { StatCardSkeleton } from '../components/UI/Skeleton';
import WebSocketDebug from '../components/Debug/WebSocketDebug';

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState([
    'stats',
    'spike',
    'sentiment',
    'volume',
    'sources',
    'feed',
  ]);
  const [draggedWidget, setDraggedWidget] = useState(null);

  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { toast } = useToast();

  const brands = brandsData?.brands || [];

  // Set first brand as selected by default
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  // Drag and drop handlers
  const handleDragStart = (widget) => {
    setDraggedWidget(widget);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetWidget) => {
    if (!draggedWidget || draggedWidget === targetWidget) return;

    const newOrder = [...widgetOrder];
    const draggedIndex = newOrder.indexOf(draggedWidget);
    const targetIndex = newOrder.indexOf(targetWidget);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedWidget);

    setWidgetOrder(newOrder);
    setDraggedWidget(null);
    toast.info('Dashboard layout updated');
  };

  const widgets = {
    stats: <StatCard brand={selectedBrand} key="stats" />,
    spike: <SpikeAlert brand={selectedBrand} key="spike" />,
    sentiment: <SentimentChart brand={selectedBrand} key="sentiment" />,
    volume: <VolumeChart brand={selectedBrand} key="volume" />,
    sources: <SourceBreakdown brand={selectedBrand} key="sources" />,
    feed: <MentionFeed brand={selectedBrand} key="feed" />,
  };

  if (brandsLoading) {
    return (
      <div className="space-y-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <>
        <EmptyState
          type="noBrands"
          action={() => setShowAddModal(true)}
          actionLabel="Add Your First Brand"
        />
        <AddBrandModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time brand mention tracking
          </p>
        </div>

        <button
          id="add-brand-button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {/* Brand Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`
              px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
              ${selectedBrand === brand
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Draggable Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgetOrder.map((widgetKey) => (
          <div
            key={widgetKey}
            draggable
            onDragStart={() => handleDragStart(widgetKey)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(widgetKey)}
            className={`
              cursor-move group relative
              ${widgetKey === 'feed' ? 'lg:col-span-2' : ''}
              ${draggedWidget === widgetKey ? 'opacity-50' : ''}
            `}
          >
            {/* Drag Handle */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-5 h-5 text-slate-400" />
            </div>
            {widgets[widgetKey]}
          </div>
        ))}
      </div>

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* WebSocket Debug (dev only) */}
      <WebSocketDebug brand={selectedBrand} />
    </div>
  );
}