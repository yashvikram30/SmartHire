import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@components/layout/Navbar';
import JobSearchBar from '@components/common/JobSearchBar';
import JobCard from '@components/jobs/JobCard';
import FilterSection from '@components/jobs/FilterSection';
import SkillSearchFilter from '@components/jobs/SkillSearchFilter';
import CategorySearchFilter from '@components/jobs/CategorySearchFilter';
import Button from '@components/common/Button';
import { publicApi } from '@api/publicApi';
import { toast } from 'react-hot-toast';

const JobListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    limit: 12,
  });
  
  // Filter States
  const [filters, setFilters] = useState({
    jobType: [],
    location: [],
    skills: [],          // Array of skill objects { _id, name }
    category: null,       // Category object { _id, name }
    salaryRange: null,
    experienceLevel: [],
  });
  
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Available filter options (these could be fetched from API)
  const filterOptions = {
    jobType: [
      { value: 'full-time', label: 'Full-time' },
      { value: 'part-time', label: 'Part-time' },
      { value: 'contract', label: 'Contract' },
      { value: 'internship', label: 'Internship' },
      { value: 'freelance', label: 'Freelance' },
    ],
    location: [
      { value: 'remote', label: 'Remote' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'onsite', label: 'On-site' },
    ],
    experienceLevel: [
      { value:'entry', label: 'Entry Level' },
      { value: 'mid', label: 'Mid Level' },
      { value: 'senior', label: 'Senior Level' },
      { value: 'lead', label: 'Lead' },
      { value: 'executive', label: 'Executive' },
    ],
    salaryRange: [
      { value: '0-50000', label: 'Under $50k' },
      { value: '50000-80000', label: '$50k - $80k' },
      { value: '80000-120000', label: '$80k - $120k' },
      { value: '120000-150000', label: '$120k - $150k' },
      { value: '150000-999999', label: '$150k+' },
    ],
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'salary-high', label: 'Highest Salary' },
    { value: 'salary-low', label: 'Lowest Salary' },
    { value: 'relevance', label: 'Most Relevant' },
  ];

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        keyword: searchParams.get('keyword') || '',
        location: searchParams.get('location') || '',
        sortBy: sortBy,
        // Add filters
        ...(filters.jobType.length > 0 && { employmentType: filters.jobType.join(',') }),
        ...(filters.skills.length > 0 && { skills: filters.skills.map(s => s._id).join(',') }),
        ...(filters.category && { category: filters.category._id }),
        ...(filters.experienceLevel.length > 0 && { experienceLevel: filters.experienceLevel.join(',') }),
        ...(filters.salaryRange && {
          salaryMin: filters.salaryRange.split('-')[0],
          salaryMax: filters.salaryRange.split('-')[1],
        }),
      };

      const response = await publicApi.getAllJobs(params);
      
      setJobs(response.data || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalJobs: response.totalJobs || 0,
        limit: response.limit || 12,
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL params when filters change
  useEffect(() => {
    fetchJobs();
  }, [pagination.currentPage, sortBy, filters, searchParams]);

  // Handler functions
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters({
      jobType: [],
      location: [],
      skills: [],
      category: null,
      salaryRange: null,
      experienceLevel: [],
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.jobType.length > 0 ||
      filters.location.length > 0 ||
      filters.skills.length > 0 ||
      filters.category !== null ||
      filters.salaryRange !== null ||
      filters.experienceLevel.length > 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Navbar />
      
      {/* Search Bar Section */}
      <div className="bg-white dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border py-8">
        <div className="container-custom">
          <JobSearchBar variant="compact" />
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-sm border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
                  Filters
                </h2>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Skills Filter - Moved to top */}
              <div className="border-b border-light-border dark:border-dark-border pb-4 mb-4">
                <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Skills
                </h3>
                <SkillSearchFilter
                  selectedSkills={filters.skills}
                  onChange={(skills) => handleFilterChange('skills', skills)}
                  maxSelections={10}
                />
              </div>

              {/* Category Filter - Moved to top */}
              <div className="border-b border-light-border dark:border-dark-border pb-4 mb-4">
                <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Category
                </h3>
                <CategorySearchFilter
                  selectedCategory={filters.category}
                  onChange={(category) => handleFilterChange('category', category)}
                />
              </div>

              {/* Job Type Filter */}
              <FilterSection
                title="Job Type"
                options={filterOptions.jobType}
                selectedValues={filters.jobType}
                onChange={(value) => handleFilterChange('jobType', value)}
                type="checkbox"
              />

              {/* Location Filter */}
              <FilterSection
                title="Location"
                options={filterOptions.location}
                selectedValues={filters.location}
                onChange={(value) => handleFilterChange('location', value)}
                type="checkbox"
              />

              {/* Experience Level Filter */}
              <FilterSection
                title="Experience Level"
                options={filterOptions.experienceLevel}
                selectedValues={filters.experienceLevel}
                onChange={(value) => handleFilterChange('experienceLevel', value)}
                type="checkbox"
              />

              {/* Salary Range Filter */}
              <FilterSection
                title="Salary Range"
                options={filterOptions.salaryRange}
                selectedValues={filters.salaryRange || ''}
                onChange={(value) => handleFilterChange('salaryRange', value)}
                type="radio"
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  {hasActiveFilters() && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium">
                      {Object.values(filters).flat().filter(Boolean).length}
                    </span>
                  )}
                </button>

                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {pagination.totalJobs} jobs found
                </p>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Cards Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <>
                {jobs.length > 0 ? (
                  <>
                    <div className="grid gap-6 mb-8">
                      {jobs.map((job) => (
                        <JobCard key={job._id} job={job} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {[...Array(pagination.totalPages)].map((_, index) => {
                          const page = index + 1;
                          // Show first, last, current, and adjacent pages
                          if (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={pagination.currentPage === page ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            page === pagination.currentPage - 2 ||
                            page === pagination.currentPage + 2
                          ) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-bg-tertiary mb-4">
                      <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                      No jobs found
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                      Try adjusting your filters or search terms
                    </p>
                    {hasActiveFilters() && (
                      <div className="flex justify-center">
                        <Button onClick={clearAllFilters} variant="outline">
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-dark-bg-secondary overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
                Filters
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="w-full mb-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-center py-2"
                >
                  Clear all filters
                </button>
              )}

              {/* Skills Filter - Moved to top */}
              <div className="border-b border-light-border dark:border-dark-border pb-4 mb-4">
                <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Skills
                </h3>
                <SkillSearchFilter
                  selectedSkills={filters.skills}
                  onChange={(skills) => handleFilterChange('skills', skills)}
                  maxSelections={10}
                />
              </div>

              {/* Category Filter - Moved to top */}
              <div className="border-b border-light-border dark:border-dark-border pb-4 mb-4">
                <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Category
                </h3>
                <CategorySearchFilter
                  selectedCategory={filters.category}
                  onChange={(category) => handleFilterChange('category', category)}
                />
              </div>

              <FilterSection
                title="Job Type"
                options={filterOptions.jobType}
                selectedValues={filters.jobType}
                onChange={(value) => handleFilterChange('jobType', value)}
                type="checkbox"
              />

              <FilterSection
                title="Location"
                options={filterOptions.location}
                selectedValues={filters.location}
                onChange={(value) => handleFilterChange('location', value)}
                type="checkbox"
              />

              <FilterSection
                title="Experience Level"
                options={filterOptions.experienceLevel}
                selectedValues={filters.experienceLevel}
                onChange={(value) => handleFilterChange('experienceLevel', value)}
                type="checkbox"
              />

              <FilterSection
                title="Salary Range"
                options={filterOptions.salaryRange}
                selectedValues={filters.salaryRange || ''}
                onChange={(value) => handleFilterChange('salaryRange', value)}
                type="radio"
              />
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-dark-bg-secondary border-t border-light-border dark:border-dark-border p-4">
              <Button
                className="w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                Show {pagination.totalJobs} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;
