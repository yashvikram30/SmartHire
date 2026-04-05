import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { publicApi } from '@api/publicApi';
import Badge from '@components/common/Badge';

const SkillSearchFilter = ({ 
  selectedSkills = [], 
  onChange, 
  maxSelections = 10,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const [defaultSkills, setDefaultSkills] = useState([]);

  // Fetch initial skills on mount
  useEffect(() => {
    const fetchDefaultSkills = async () => {
      try {
        const response = await publicApi.getAllSkills({ limit: 20 });
        const skillsArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.skills || response.skills || []);
        setDefaultSkills(skillsArray);
      } catch (error) {
        console.error('Error fetching default skills:', error);
      }
    };
    fetchDefaultSkills();
  }, []);

  // Debounced search and default skills handling
  useEffect(() => {
    // If search term is empty, show default skills
    if (searchTerm.trim().length === 0) {
      // Filter out selected skills from default list
      const availableDefaults = defaultSkills.filter(
        skill => !selectedSkills.some(selected => selected._id === skill._id)
      );
      setSearchResults(availableDefaults);
      return;
    }

    if (searchTerm.trim().length < 2) {
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await publicApi.searchSkills({ 
          q: searchTerm, 
          limit: 10 
        });
        
        // Handle response - check if data is array or nested
        const skillsArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.skills || response.skills || []);
        
        // Filter out already selected skills
        const availableSkills = skillsArray.filter(
          skill => !selectedSkills.some(selected => selected._id === skill._id)
        );
        
        setSearchResults(availableSkills);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching skills:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedSkills, defaultSkills]);

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

  const handleSelectSkill = (skill) => {
    if (selectedSkills.length >= maxSelections) {
      return;
    }
    
    onChange([...selectedSkills, skill]);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skillId) => {
    onChange(selectedSkills.filter(skill => skill._id !== skillId));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge 
              key={skill._id} 
              variant="primary" 
              size="sm"
              className="flex items-center space-x-1"
            >
              <span>{skill.name}</span>
              <button
                onClick={() => handleRemoveSkill(skill._id)}
                className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${skill.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              selectedSkills.length >= maxSelections
                ? `Max ${maxSelections} skills selected`
                : 'Search skills...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            disabled={selectedSkills.length >= maxSelections}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 animate-spin" />
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((skill) => (
              <button
                key={skill._id}
                onClick={() => handleSelectSkill(skill)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-sm"
              >
                <div className="font-medium text-light-text dark:text-dark-text">
                  {skill.name}
                </div>
                {skill.category && (
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {skill.category}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showDropdown && searchResults.length === 0 && searchTerm.length >= 2 && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-400 italic text-center">
              No skills found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {selectedSkills.length > 0 && (
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {selectedSkills.length} / {maxSelections} skills selected
        </p>
      )}
    </div>
  );
};

export default SkillSearchFilter;
