import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ChevronRight } from 'lucide-react';
import { publicApi } from '@api/publicApi';

const CategorySearchFilter = ({ 
  selectedCategory = null, 
  onChange,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch categories on mount and when search term changes
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await publicApi.getAllCategories({ 
          q: searchTerm || undefined,
          view: 'flat',
          limit: 20 
        });
        
        // Handle response - check if data is array or nested
        const categoriesArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.categories || response.categories || []);
        
        setCategories(categoriesArray);
        if (searchTerm.length > 0 || showDropdown) {
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (category) => {
    onChange(category);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleClearCategory = () => {
    onChange(null);
    setSearchTerm('');
  };

  // Format category display with parent hierarchy
  const formatCategoryDisplay = (category) => {
    if (category.parentId) {
      // Find parent category name if available
      const parent = categories.find(c => c._id === category.parentId);
      if (parent) {
        return `${parent.name} > ${category.name}`;
      }
    }
    return category.name;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Category */}
      {selectedCategory && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center space-x-2">
            {selectedCategory.parentId && (
              <>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {formatCategoryDisplay(selectedCategory).split(' > ')[0]}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </>
            )}
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {selectedCategory.name}
            </span>
          </div>
          <button
            onClick={handleClearCategory}
            className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-colors"
            aria-label="Clear category"
          >
            <X className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 animate-spin" />
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && categories.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory?._id === category._id;
              
              return (
                <button
                  key={category._id}
                  onClick={() => handleSelectCategory(category)}
                  className={`
                    w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors
                    ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {category.parentId && (
                      <>
                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          Parent
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </>
                    )}
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-light-text dark:text-dark-text'}`}>
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {showDropdown && categories.length === 0 && searchTerm.length >= 2 && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-400 italic text-center">
              No categories found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySearchFilter;
