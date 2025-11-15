import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { useAddBrand } from '../../hooks/useBrands';
import { useToast } from '../../context/ToastContext';

const popularBrands = ['Nike', 'Apple', 'Tesla', 'Google', 'Microsoft', 'Amazon', 'Netflix', 'Spotify'];

export default function AddBrandModal({ isOpen, onClose }) {
  const [brandName, setBrandName] = useState('');
  const { mutate: addBrand, isLoading } = useAddBrand();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    addBrand(brandName.trim(), {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(`Started tracking ${brandName}`);
        } else {
          toast.error(data.message || 'Failed to add brand');
        }
        setBrandName('');
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add brand');
      },
    });
  };

  const handlePopularBrandClick = (brand) => {
    setBrandName(brand);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add Brand to Track
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Brand Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Popular Brands */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Popular Brands
            </p>
            <div className="flex flex-wrap gap-2">
              {popularBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handlePopularBrandClick(brand)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!brandName.trim() || isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isLoading ? 'Adding...' : 'Add Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}