import { Mail, MapPin, Calendar, Globe, Building2, Users2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';

const RecruiterCard = ({ profile, onVerify, onReject, onVisitProfile, loading }) => {
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
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
            {profile.companyLogo ? (
              <img 
                src={profile.companyLogo} 
                alt={profile.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Company & Recruiter Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {profile.companyName}
              </h3>
              <Badge variant={getStatusBadgeVariant(profile.verificationStatus)} size="sm">
                {profile.verificationStatus}
              </Badge>
            </div>

            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
              <div className="flex items-center space-x-1 mb-1">
                <Mail className="w-4 h-4" />
                <span>{profile.userId?.name || 'N/A'}</span>
                <span className="mx-1">•</span>
                <span>{profile.userId?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="mb-2">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Profile ID: </span>
              <span className="text-xs font-bold text-light-text dark:text-dark-text">{profile._id}</span>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {profile.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {profile.location.city}, {profile.location.state}, {profile.location.country}
                  </span>
                </div>
              )}

              {profile.industry && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span>{profile.industry}</span>
                </div>
              )}

              {profile.companySize && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users2 className="w-4 h-4" />
                  <span>{profile.companySize} employees</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 dark:hover:text-primary-400 underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Applied {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* Company Description */}
            {profile.companyDescription && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {profile.companyDescription}
              </p>
            )}
          </div>
        </div>

        {/* Verification Status Icon */}
        <div className="flex items-center space-x-2">
          {profile.isVerified ? (
            <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
          ) : profile.verificationStatus === 'rejected' ? (
            <XCircle className="w-6 h-6 text-error-600 dark:text-error-400" />
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center space-x-2">
          {profile.verificationStatus === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerify(profile._id)}
                disabled={loading}
                className="text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 border-success-200"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Verify
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(profile._id)}
                disabled={loading}
                className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 border-error-200"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {profile.verificationStatus === 'verified' && (
            <Badge variant="success" size="sm">
              <CheckCircle className="w-3 h-3 mr-1 inline" />
              Verified Account
            </Badge>
          )}
          
          {profile.verificationStatus === 'rejected' && profile.verificationNotes && (
            <div className="text-sm text-error-600 dark:text-error-400">
              <span className="font-medium">Rejection reason: </span>
              <span>{profile.verificationNotes}</span>
            </div>
          )}
        </div>

        {/* Visit Public Profile Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onVisitProfile(profile._id)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Visit Public Profile
        </Button>
      </div>
    </motion.div>
  );
};

export default RecruiterCard;
