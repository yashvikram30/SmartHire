import { Link } from 'react-router-dom';
import { Calendar, Building, MapPin, Briefcase } from 'lucide-react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';

const ApplicationCard = ({ application }) => {
  const job = application.jobId || {};
  const company = job.companyId || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'warning';
      case 'reviewed':
        return 'primary';
      case 'shortlisted':
      case 'interviewing':
        return 'success';
      case 'rejected':
      case 'withdrawn':
        return 'error';
      case 'offered':
      case 'hired':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/jobseeker/applications/${application._id}`}>
      <Card hover className="p-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
          <div className="flex items-start space-x-4 mb-4 sm:mb-0">
            {company.companyLogo ? (
              <img
                src={company.companyLogo}
                alt={company.companyName}
                className="w-12 h-12 rounded-lg object-cover border border-light-border dark:border-dark-border"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-xl text-primary-600 border border-light-border dark:border-dark-border">
                {company.companyName?.charAt(0) || 'C'}
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text hover:text-primary-600 transition-colors">
                {job.title || 'Unknown Position'}
              </h3>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-center mt-1">
                <Building className="w-4 h-4 mr-1" />
                {company.companyName || 'Unknown Company'}
              </div>
            </div>
          </div>
          
          <Badge variant={getStatusColor(application.status)} className="capitalize self-start sm:self-auto">
            {getStatusText(application.status)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-light-border dark:border-dark-border mt-4">
          <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Applied: {formatDate(application.appliedAt)}
          </div>
          
          <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Briefcase className="w-4 h-4 mr-2 capitalize" />
            {job.employmentType || 'Full-time'}
          </div>
          
          <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <MapPin className="w-4 h-4 mr-2" />
            {job.location?.city ? `${job.location.city}, ${job.location.country}` : 'Remote'}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ApplicationCard;
