import { Mail, Calendar, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';

const UserCard = ({ user, onActivate, onDeactivate, onDelete, loading }) => {
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'recruiter':
        return 'warning';
      case 'jobseeker':
        return 'primary';
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
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-lg">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {user.name}
              </h3>
              <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                {user.role}
              </Badge>
            </div>

            <div className="flex items-center space-x-1 text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            
            <div className="mb-2">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">ID: </span>
              <span className="text-xs font-bold text-light-text dark:text-dark-text">{user._id}</span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center space-x-1">
                  <span>Last login: {formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          {user.isActive ? (
            <Badge variant="success" size="sm">
              <CheckCircle className="w-3 h-3 mr-1 inline" />
              Active
            </Badge>
          ) : (
            <Badge variant="error" size="sm">
              <XCircle className="w-3 h-3 mr-1 inline" />
              Inactive
            </Badge>
          )}
        </div>
      </div>

      {/* Verification & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center space-x-2 text-sm">
          {user.isVerified ? (
            <span className="text-success-600 dark:text-success-400 flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Verified
            </span>
          ) : (
            <span className="text-warning-600 dark:text-warning-400 flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Not Verified
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {user.isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(user._id)}
              disabled={loading}
              className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 border-error-200"
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActivate(user._id)}
              disabled={loading}
              className="text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 border-success-200"
            >
              Activate
            </Button>
          )}
          
          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user._id)}
            disabled={loading}
            className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 border-error-200"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
