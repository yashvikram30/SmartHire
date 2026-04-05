import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Loader2, Search, MapPin, Briefcase } from 'lucide-react';
import { recruiterApi } from '@api/recruiterApi';
import CandidateCard from '@components/recruiter/candidates/CandidateCard';
import Button from '@components/common/Button';
import SkillSearchFilter from '@components/jobs/SkillSearchFilter';
import toast from 'react-hot-toast';

const CandidateSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    skills: [], 
    location: searchParams.get('location') || '',
    minExperience: '',
    maxExperience: ''
  });

  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);

  // Debounce keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        // Format skills for API (comma-separated IDs)
        const skillsParam = filters.skills.map(skill => skill._id || skill).join(',');

        const params = {
          page: currentPage,
          limit: 10,
          keyword: debouncedKeyword,
          location: filters.location,
          skills: skillsParam,
          minExperience: filters.minExperience,
          maxExperience: filters.maxExperience
        };

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === undefined || params[key] === null) {
            delete params[key];
          }
        });

        const response = await recruiterApi.searchJobSeekers(params);
        
        // Handle response flexibility
        const data = response.data || response;
        const items = data.jobSeekers || data.candidates || [];
        
        setCandidates(items);
        setTotalCandidates(data.total || data.count || 0);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 10));

        // Update URL params (optional, keeps URL in sync)
        const newParams = new URLSearchParams();
        if (debouncedKeyword) newParams.set('keyword', debouncedKeyword);
        if (filters.location) newParams.set('location', filters.location);
        setSearchParams(newParams, { replace: true });

      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Failed to load candidates');
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [currentPage, debouncedKeyword, filters.skills, filters.location, filters.minExperience, filters.maxExperience]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: '',
      skills: [],
      location: '',
      minExperience: '',
      maxExperience: ''
    });
    setDebouncedKeyword('');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      filters.keyword ||
      filters.skills.length > 0 ||
      filters.location ||
      filters.minExperience ||
      filters.maxExperience
    );
  };

  // Filter Sidebar Content used in both desktop and mobile
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Skills Filter */}
      <div className="border-b border-light-border dark:border-dark-border pb-6">
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Skills</h3>
        <SkillSearchFilter
          selectedSkills={filters.skills}
          onChange={(skills) => handleFilterChange('skills', skills)}
          maxSelections={10}
        />
      </div>

      {/* Location Filter */}
      <div className="border-b border-light-border dark:border-dark-border pb-6">
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Location</h3>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="City, state, or remote"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Experience Filter */}
      <div className="pb-6">
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Experience (Years)</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minExperience}
            onChange={(e) => handleFilterChange('minExperience', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxExperience}
            onChange={(e) => handleFilterChange('maxExperience', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="container-custom py-8">
        
        {/* Header & Mobile Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Find Candidates</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Discover talent based on skills, experience, and location
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="lg:hidden w-full md:w-auto"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters {hasActiveFilters() && '(Active)'}
          </Button>
        </div>

        {/* Search Bar - Main Keyword */}
        <div className="mb-8 relative">
           <div className="relative max-w-2xl">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input
               type="text"
               placeholder="Search by keywords, job title, or name..."
               value={filters.keyword}
               onChange={(e) => handleFilterChange('keyword', e.target.value)}
               className="w-full pl-12 pr-4 py-4 rounded-xl shadow-md border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-secondary text-light-text dark:text-dark-text outline-none ring-0 focus:ring-0 focus:outline-none focus:border-primary-500 transition-all duration-300 text-lg"
               style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
             />
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl border border-light-border dark:border-dark-border sticky top-24">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="font-bold text-lg text-light-text dark:text-dark-text">Filters</h2>
                 {hasActiveFilters() && (
                   <button 
                     onClick={clearAllFilters}
                     className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                   >
                     Clear all
                   </button>
                 )}
               </div>
               <FilterContent />
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
              </div>
            ) : candidates.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Found <span className="font-semibold text-light-text dark:text-dark-text">{totalCandidates}</span> candidates
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {candidates.map(candidate => (
                    <CandidateCard key={candidate._id} candidate={candidate} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-light-text dark:text-dark-text">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-bg-tertiary mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                  No candidates found
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters() && (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-dark-bg-secondary overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Filters</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FilterContent />
              <div className="mt-8 pt-6 border-t border-light-border dark:border-dark-border flex gap-4">
                 <Button 
                   variant="outline" 
                   className="flex-1"
                   onClick={clearAllFilters}
                 >
                   Clear
                 </Button>
                 <Button 
                   className="flex-1"
                   onClick={() => setShowMobileFilters(false)}
                 >
                   Show Results
                 </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;
