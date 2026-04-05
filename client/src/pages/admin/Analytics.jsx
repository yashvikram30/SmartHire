import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, RefreshCw, AlertCircle, Briefcase, Clock, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '@api/adminApi';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Spinner from '@components/common/Spinner';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getJobStatistics();
      setStatistics(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Calculate percentage
  const calculatePercentage = (count, total) => {
    if (!total || total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200',
      'pending-approval': 'bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200',
      'closed': 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200',
      'rejected': 'bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200',
      'draft': 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status bar color
  const getStatusBarColor = (status) => {
    const colors = {
      'active': 'bg-success-500',
      'pending-approval': 'bg-warning-500',
      'closed': 'bg-gray-500',
      'rejected': 'bg-error-500',
      'draft': 'bg-primary-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  // Calculate total jobs
  const totalJobs = statistics?.statusCounts
    ? Object.values(statistics.statusCounts).reduce((acc, val) => acc + val, 0)
    : 0;

  // Format date for last updated
  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                  Analytics Dashboard
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Platform-wide statistics and insights
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={fetchStatistics}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          
          {lastUpdated && (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-center space-x-2 mt-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && !statistics && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-error-900 dark:text-error-100">Error</p>
              <p className="text-sm text-error-700 dark:text-error-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Analytics Content */}
        {!loading && statistics && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg border border-light-border dark:border-dark-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Total Jobs
                  </p>
                  <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl font-bold text-light-text dark:text-dark-text">
                  {formatNumber(totalJobs)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg border border-light-border dark:border-dark-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Active Jobs
                  </p>
                  <TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                  {formatNumber(statistics.statusCounts?.active || 0)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg border border-light-border dark:border-dark-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Pending Approval
                  </p>
                  <Clock className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                  {formatNumber(statistics.statusCounts?.['pending-approval'] || 0)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg border border-light-border dark:border-dark-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Total Categories
                  </p>
                  <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {formatNumber(statistics.categoryCounts?.length || 0)}
                </p>
              </motion.div>
            </div>

            {/* Job Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                Job Status Distribution
              </h2>
              
              <div className="space-y-4">
                {statistics.statusCounts && Object.entries(statistics.statusCounts).map(([status, count], index) => (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(status)} size="sm">
                          {status === 'pending-approval' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <span className="text-sm font-medium text-light-text dark:text-dark-text">
                          {formatNumber(count)} jobs
                        </span>
                      </div>
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {calculatePercentage(count, totalJobs)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculatePercentage(count, totalJobs)}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={`h-2 rounded-full ${getStatusBarColor(status)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Category Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6"
              >
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                  Top Categories
                </h2>
                
                {statistics.categoryCounts && statistics.categoryCounts.length > 0 ? (
                  <div className="space-y-4">
                    {statistics.categoryCounts.slice(0, 5).map((cat, index) => {
                      const maxCount = Math.max(...statistics.categoryCounts.map(c => c.count));
                      const percentage = calculatePercentage(cat.count, maxCount);
                      
                      return (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                              {cat.category}
                            </span>
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary ml-2">
                              {formatNumber(cat.count)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.35 + index * 0.1, duration: 0.5 }}
                              className="h-2 rounded-full bg-primary-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    No category data available
                  </p>
                )}
              </motion.div>

              {/* Experience Level Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6"
              >
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                  Experience Level Distribution
                </h2>
                
                {statistics.experienceLevelCounts && (
                  <div className="space-y-4">
                    {Object.entries(statistics.experienceLevelCounts).map(([level, count], index) => {
                      const total = Object.values(statistics.experienceLevelCounts).reduce((a, b) => a + b, 0);
                      const percentage = calculatePercentage(count, total);
                      
                      return (
                        <div key={level}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-light-text dark:text-dark-text">
                              {level}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {formatNumber(count)}
                              </span>
                              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                              className="h-2 rounded-full bg-success-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Employment Type Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6"
              >
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                  Employment Type Breakdown
                </h2>
                
                {statistics.employmentTypeCounts && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(statistics.employmentTypeCounts).map(([type, count]) => {
                      const total = Object.values(statistics.employmentTypeCounts).reduce((a, b) => a + b, 0);
                      const percentage = calculatePercentage(count, total);
                      
                      return (
                        <div
                          key={type}
                          className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg border border-light-border dark:border-dark-border"
                        >
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                            {type}
                          </p>
                          <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {formatNumber(count)}
                          </p>
                          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {percentage}% of total
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Recent Job Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6"
              >
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                  Recent Job Posting Trends
                </h2>
                
                {statistics.recentJobTrends && statistics.recentJobTrends.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.recentJobTrends.slice(-7).map((trend, index) => {
                      const maxCount = Math.max(...statistics.recentJobTrends.map(t => t.count));
                      const percentage = calculatePercentage(trend.count, maxCount);
                      
                      return (
                        <div key={trend._id} className="flex items-center space-x-3">
                          <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary w-20">
                            {new Date(trend._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                                className="h-6 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-end pr-2"
                              >
                                <span className="text-xs font-medium text-white">
                                  {trend.count}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    No trend data available
                  </p>
                )}
              </motion.div>
            </div>

            {/* Top Companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border overflow-hidden"
            >
              <div className="p-6 border-b border-light-border dark:border-dark-border">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
                  Top Companies by Performance
                </h2>
              </div>
              
              {statistics.topCompanies && statistics.topCompanies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                          Jobs Posted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                          Total Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                          Applications
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-dark-border">
                      {statistics.topCompanies.map((company, index) => (
                        <tr
                          key={company.companyId}
                          className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <span className="text-sm font-medium text-light-text dark:text-dark-text">
                                {company.companyName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-light-text dark:text-dark-text font-semibold">
                              {formatNumber(company.jobCount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              {formatNumber(company.totalViews)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-success-600 dark:text-success-400 font-semibold">
                              {formatNumber(company.totalApplications)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
                    No company data available
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
