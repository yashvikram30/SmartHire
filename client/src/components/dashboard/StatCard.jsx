import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'primary',
  loading = false,
  change = null,
  className = ''
}) => {
  const variants = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
      iconBg: 'bg-primary-500',
      text: 'text-primary-600 dark:text-primary-400',
    },
    success: {
      bg: 'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
      iconBg: 'bg-success-500',
      text: 'text-success-600 dark:text-success-400',
    },
    warning: {
      bg: 'bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20',
      iconBg: 'bg-warning-500',
      text: 'text-warning-600 dark:text-warning-400',
    },
    info: {
      bg: 'bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
      iconBg: 'bg-accent-500',
      text: 'text-accent-600 dark:text-accent-400',
    },
  };

  const currentVariant = variants[variant] || variants.primary;

  if (loading) {
    return (
      <div className={`p-6 rounded-xl bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-xl ${currentVariant.bg} border border-light-border dark:border-dark-border hover:shadow-lg transition-shadow duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          {title}
        </h3>
        <div className={`p-2.5 rounded-lg ${currentVariant.iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-1">
        <motion.p
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`text-3xl font-bold ${currentVariant.text}`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </motion.p>

        {change !== null && (
          <div className="flex items-center space-x-1">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-error-500" />
            )}
            <span className={`text-xs font-medium ${change >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
