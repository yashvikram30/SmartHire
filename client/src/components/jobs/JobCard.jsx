import { useState } from 'react';
import { MapPin, Briefcase, DollarSign, Clock, Bookmark, ChevronDown, ChevronUp, ExternalLink, Building, GraduationCap, Users, Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import useAuthStore from '@store/authStore';
import { jobSeekerApi } from '@api/jobSeekerApi';
import { publicApi } from '@api/publicApi';
import ViewCountBadge from '@components/jobs/ViewCountBadge';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to handle different data structures (populated vs flat)
  const company = job.companyId || job.company || {};
  const companyName = company.companyName || company.name || 'Company Name';
  const companyLogo = company.companyLogo || company.logo;
  
  // Helper for location
  const formatLocation = (location) => {
    if (!location) return 'Remote';
    if (typeof location === 'string') return location;
    
    // Check if explicitly remote
    if (location.isRemote) return 'Remote';

    // If it's an object with city/state/country
    const parts = [location.city, location.state, location.country].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    
    return 'Location not specified';
  };

  const handleSaveJob = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save this job');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'candidate') return;

    try {
      setSaving(true);
      await jobSeekerApi.saveJob(job._id);
      toast.success('Job saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to apply for this job');
      navigate('/login');
      return;
    }
    toast.success('Application functionality coming soon!');
  };

  const handleVisitCompany = (e) => {
    e.stopPropagation();
    if (company._id) {
      navigate(`/companies/${company._id}`);
    } else {
       toast.error('Company profile not available');
    }
  };

  // Track view when card is expanded (authenticated users only)
  const handleCardExpand = async () => {
    const wasExpanded = isExpanded;
    setIsExpanded(!isExpanded);
    
    // Track view on first expand for authenticated users only
    if (!wasExpanded && isAuthenticated && !hasTrackedView) {
      try {
        await publicApi.trackJobView(job._id, {
          ipAddress: 'client', // Backend will extract real IP
          userAgent: navigator.userAgent
        });
        setHasTrackedView(true);
      } catch (error) {
        console.error('Failed to track view:', error);
        // Silent failure - don't interrupt user experience
      }
    }
  };

  // Hide action buttons for non-candidates (Recruiters/Admins)
  const showActions = !isAuthenticated || user?.role === 'candidate';

  return (
    <Card
      className={`p-6 transition-all duration-300 border-l-4 ${
        isExpanded ? 'border-l-primary-600 shadow-md ring-1 ring-primary-100 dark:ring-primary-900' : 'border-l-transparent hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800'
      } cursor-default relative`}
      onClick={handleCardExpand}
    >
      {/* View Count Badge - Positioned in top-right */}
      <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
        <ViewCountBadge count={job.views || 0} size="sm" />
      </div>

      <div className="flex items-start justify-between mb-4 cursor-pointer">
        <div className="flex items-start space-x-4 flex-1 pr-20">
          {/* Company Logo */}
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          )}

          {/* Job Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
              {job.title}
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
              {companyName}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{formatLocation(job.location)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="w-4 h-4" />
                <span>{job.employmentType || 'Full-time'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{getTimeAgo(job.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Indicator - Moved to bottom */}
      <div className="flex items-center justify-center mt-2">
        <button 
          className="px-4 py-1 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-1"
          onClick={(e) => {
            e.stopPropagation();
            handleCardExpand();
          }}
        >
          <span>{isExpanded ? 'Show less' : 'Show more'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Description Preview (Collapsed) or Full (Expanded) */}
      <div className={`text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {job.description}
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border space-y-6">
            
            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-2">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Education</p>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text capitalize">
                            {job.education?.minDegree || 'Not specified'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-start space-x-2">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text">
                            {job.experienceYears ? `${job.experienceYears.min} - ${job.experienceYears.max} Years` : 'Not specified'}
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Openings</p>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text">
                            {job.numberOfOpenings || 1} Position(s)
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Deadline</p>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text">
                            {formatDate(job.applicationDeadline)}
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <Layers className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text capitalize">
                            {job.category?.name || 'General'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
                <div>
                    <h4 className="font-semibold text-light-text dark:text-dark-text mb-2">Qualifications</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {job.qualifications.map((qual, idx) => (
                            <li key={idx}>{qual}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}

      {/* Skills (Always visible but expanded view) */}
      {(() => {
        const displaySkills = job.skills || job.requiredSkills || [];
        if (displaySkills.length === 0) return null;
        
        return (
          <div className={isExpanded ? 'mt-6' : 'mt-4 mb-4'}>
            {isExpanded && (
              <h4 className="font-semibold text-light-text dark:text-dark-text mb-3">Skills</h4>
            )}
            <div className="flex flex-wrap gap-2">
              {displaySkills.slice(0, isExpanded ? undefined : 5).map((skill, index) => (
                <Badge key={index} variant="secondary" size={isExpanded ? 'md' : 'sm'}>
                  {skill.displayName || skill.name || skill}
                </Badge>
              ))}
              {!isExpanded && displaySkills.length > 5 && (
                <Badge variant="secondary" size="sm">
                  +{displaySkills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        );
      })()}

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border mt-4">
        <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-semibold">
          <DollarSign className="w-5 h-5" />
          <span>{formatSalary(job.salary?.min || job.salaryMin, job.salary?.max || job.salaryMax)}</span>
        </div>
        
        {/* Expanded Actions */}
        {isExpanded ? (
             <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={handleVisitCompany}>
                    <Building className="w-4 h-4 mr-1" />
                    Company
                </Button>
                
                {showActions && (
                    <>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSaveJob}
                            disabled={saving}
                        >
                            <Bookmark className={`w-4 h-4 mr-1 ${saving ? 'animate-pulse' : ''}`} />
                            Save
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleApply}>
                            Apply Now
                            <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                    </>
                )}
             </div>
        ) : (
             <div className="flex items-center space-x-2">
                {job.isUrgent && <Badge variant="error">Urgent</Badge>}
                {showActions && (
                    <button
                        onClick={handleSaveJob}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                        aria-label="Save job"
                    >
                        <Bookmark className="w-5 h-5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" />
                    </button>
                )}
             </div>
        )}
      </div>
    </Card>
  );
};

export default JobCard;
