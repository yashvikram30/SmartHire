import { Briefcase, MapPin, Calendar, DollarSign, Building2, Users2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';

const JobCard = ({ job, onApprove, onReject, onViewJob, loading }) => {
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending-approval':
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'closed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    const { min, max, currency } = salary;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+`;
    }
    return 'Not specified';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Company Logo */}
          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center overflow-hidden flex-shrink-0">
            {job.companyId?.companyLogo ? (
              <img 
                src={job.companyId.companyLogo} 
                alt={job.companyId.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {job.title}
              </h3>
              <Badge variant={getStatusBadgeVariant(job.status)} size="sm">
                {job.status === 'pending-approval' ? 'Pending' : job.status}
              </Badge>
            </div>

            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
              <div className="flex items-center space-x-2 mb-1">
                <Building2 className="w-4 h-4" />
                <span>{job.companyId?.companyName || 'N/A'}</span>
                {job.companyId?.industry && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{job.companyId.industry}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Users2 className="w-4 h-4" />
                <span>Posted by: {job.recruiterId?.name || 'N/A'}</span>
                <span className="mx-1">•</span>
                <span>{job.recruiterId?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="mb-2">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Job ID: </span>
              <span className="text-xs font-bold text-light-text dark:text-dark-text">{job._id}</span>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {job.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {job.location.city}, {job.location.state}, {job.location.country}
                  </span>
                </div>
              )}

              {job.salary && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
            </div>

            {/* Job Description */}
            {job.description && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {job.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex items-center space-x-2">
          {job.status === 'active' ? (
            <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
          ) : job.status === 'rejected' ? (
            <XCircle className="w-6 h-6 text-error-600 dark:text-error-400" />
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center space-x-2">
          {(job.status === 'pending-approval' || job.status === 'pending') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApprove(job._id)}
                disabled={loading}
                className="text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 border-success-200"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(job._id)}
                disabled={loading}
                className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 border-error-200"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {job.status === 'active' && (
            <Badge variant="success" size="sm">
              <CheckCircle className="w-3 h-3 mr-1 inline" />
              Active Job
            </Badge>
          )}
          
          {job.status === 'rejected' && job.moderationNotes && (
            <div className="text-sm text-error-600 dark:text-error-400">
              <span className="font-medium">Rejection reason: </span>
              <span>{job.moderationNotes}</span>
            </div>
          )}
        </div>

        {/* View Full Job Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewJob(job._id)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Full Job
        </Button>
      </div>
    </motion.div>
  );
};

export default JobCard;
