import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import Button from '@components/common/Button';

const JobSearchBar = ({ className = '', variant = 'default' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchData, setSearchData] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
  });

  // Sync with URL params
  useEffect(() => {
    setSearchData({
      keyword: searchParams.get('keyword') || '',
      location: searchParams.get('location') || '',
    });
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?keyword=${searchData.keyword}&location=${searchData.location}`);
  };

  // Variant styles
  const variants = {
    default: {
      container: 'shadow-xl border border-gray-100 dark:border-dark-border',
      input: 'bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary',
    },
    compact: {
      container: 'shadow-md border border-gray-200 dark:border-dark-border',
      input: 'bg-white dark:bg-dark-bg-secondary',
    },
    minimal: {
      container: 'shadow-sm border border-gray-200 dark:border-dark-border',
      input: 'bg-transparent',
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <form
      onSubmit={handleSearch}
      className={`relative ${className}`}
    >
      <div className={`flex flex-col md:flex-row gap-3 p-3 rounded-2xl bg-white dark:bg-dark-bg-secondary ${currentVariant.container}`}>
        {/* Job Title Input */}
        <div className={`flex-1 flex items-center space-x-3 px-5 py-3 rounded-xl transition-colors group ${currentVariant.input}`}>
          <Search className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchData.keyword}
            onChange={(e) => setSearchData({ ...searchData, keyword: e.target.value })}
            className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 text-light-text dark:text-dark-text placeholder-gray-400 text-base"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Location Input */}
        <div className={`flex-1 flex items-center space-x-3 px-5 py-3 rounded-xl transition-colors group ${currentVariant.input}`}>
          <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="City, state, or remote"
            value={searchData.location}
            onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
            className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 text-light-text dark:text-dark-text placeholder-gray-400 text-base"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          size="lg"
          className="md:w-auto w-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Search className="w-5 h-5 mr-2" />
          Search Jobs
        </Button>
      </div>

      {/* Decorative gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
    </form>
  );
};

export default JobSearchBar;
