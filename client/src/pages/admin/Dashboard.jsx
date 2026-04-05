import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, Building, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@components/dashboard/StatCard';
import { adminApi } from '@api/adminApi';
import useAuthStore from '@store/authStore';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 0,
    totalRecruiters: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAdminDashboardStats();
      
      // Handle the actual backend response structure
      const data = response.data || response;
      
      setStats({
        totalUsers: data.users?.total || 0,
        activeUsers: data.users?.jobSeekers || 0, // Assuming active users are job seekers
        totalJobs: data.jobs?.total || 0,
        totalRecruiters: data.users?.recruiters || 0,
        totalApplications: data.applications?.total || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
      // Keep zeros as fallback
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-2">
          {getGreeting()}, {user?.name || 'Admin'}!
        </h1>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Here's what's happening with your today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          variant="primary"
          loading={loading}
        />

        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserCheck}
          variant="success"
          loading={loading}
        />

        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          variant="info"
          loading={loading}
        />

        <StatCard
          title="Company Profiles"
          value={stats.totalRecruiters}
          icon={Building}
          variant="warning"
          loading={loading}
        />
      </div>

      {/* Full Width Stat */}
      <div className="grid grid-cols-1">
        <StatCard
          title="Total Active Applications"
          value={stats.totalApplications}
          icon={FileText}
          variant="primary"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border dark:border-dark-border"
      >
        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-left group"
          >
            <Users className="w-6 h-6 text-primary-600 dark:text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-light-text dark:text-dark-text">
              Manage Users
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/recruiters/verify'}
            className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors text-left group"
          >
            <Building className="w-6 h-6 text-success-600 dark:text-success-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-light-text dark:text-dark-text">
              Verify Recruiters
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/jobs/moderate'}
            className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors text-left group"
          >
            <Briefcase className="w-6 h-6 text-warning-600 dark:text-warning-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-light-text dark:text-dark-text">
              Moderate Jobs
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/analytics'}
            className="p-4 rounded-lg bg-accent-50 dark:bg-accent-900/20 hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors text-left group"
          >
            <FileText className="w-6 h-6 text-accent-600 dark:text-accent-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-light-text dark:text-dark-text">
              View Analytics
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
