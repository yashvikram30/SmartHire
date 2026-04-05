import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FilterSection = ({ title, options = [], selectedValues = [], onChange, type = 'checkbox' }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option =>
    option.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (value) => {
    if (type === 'checkbox') {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onChange(newValues);
    } else {
      onChange(value);
    }
  };

  return (
    <div className="border-b border-light-border dark:border-dark-border pb-4 mb-4 last:border-b-0">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 text-left"
      >
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-2">
          {/* Search for longer lists */}
          {options.length > 8 && (
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}

          {/* Options */}
          <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
            {filteredOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <input
                  type={type}
                  name={type === 'radio' ? title : undefined}
                  checked={
                    type === 'checkbox'
                      ? selectedValues.includes(option.value)
                      : selectedValues === option.value
                  }
                  onChange={() => handleToggle(option.value)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary group-hover:text-light-text dark:group-hover:text-dark-text transition-colors">
                  {option.label}
                  {option.count !== undefined && (
                    <span className="ml-1 text-xs text-gray-400">({option.count})</span>
                  )}
                </span>
              </label>
            ))}
          </div>

          {filteredOptions.length === 0 && (
            <p className="text-sm text-gray-400 italic py-2">No options found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSection;
