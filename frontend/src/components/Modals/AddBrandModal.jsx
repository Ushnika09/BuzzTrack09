import { useState, useEffect } from 'react';
import { X, Search, Plus, AlertCircle } from 'lucide-react';
import { useAddBrand } from '../../hooks/useBrands';
import { useToast } from '../../context/ToastContext';

const popularBrands = [
  'Nike', 
  'Apple', 
  'Tesla', 
  'Google', 
  'Microsoft', 
  'Amazon', 
  'Netflix', 
  'Spotify'
];

export default function AddBrandModal({ isOpen, onClose }) {
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState('');
  const { mutate: addBrand, isLoading, isError, error: mutationError } = useAddBrand();
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setBrandName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validation
    if (!brandName.trim()) {
      setError('Please enter a brand name');
      return;
    }

    // Trim and validate length
    const cleanBrandName = brandName.trim();
    if (cleanBrandName.length < 2) {
      setError('Brand name must be at least 2 characters');
      return;
    }

    if (cleanBrandName.length > 50) {
      setError('Brand name must be less than 50 characters');
      return;
    }

    // Execute mutation
    addBrand(cleanBrandName, {
      onSuccess: (data) => {
        console.log('Add brand response:', data);
        
        if (data?.success) {
          toast.success(`Started tracking ${cleanBrandName}`);
          setBrandName('');
          onClose();
        } else {
          const errorMsg = data?.message || 'Failed to add brand';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      },
      onError: (err) => {
        console.error('Add brand error:', err);
        
        const errorMsg = err?.response?.data?.error || 
                        err?.message || 
                        'Failed to add brand. Please try again.';
        
        setError(errorMsg);
        toast.error(errorMsg);
      },
    });
  };

  const handlePopularBrandClick = (brand) => {
    setBrandName(brand);
    setError('');
  };

  const handleInputChange = (e) => {
    setBrandName(e.target.value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add Brand to Track
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label 
              htmlFor="brandName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Brand Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="brandName"
                type="text"
                value={brandName}
                onChange={handleInputChange}
                placeholder="Enter brand name..."
                className={`w-full pl-10 pr-4 py-3 border ${
                  error 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                } rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:border-transparent transition-colors`}
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
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
                  disabled={isLoading}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!brandName.trim() || isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Brand</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}