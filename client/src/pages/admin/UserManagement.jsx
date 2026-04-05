import { useState, useEffect } from 'react';
import { Search, Filter, Users, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '@api/adminApi';
import UserCard from '@components/admin/UserCard';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import Badge from '@components/common/Badge';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'deactivate' or 'delete'
    user: null,
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit,
      };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (roleFilter) {
        params.role = roleFilter;
      }
      
      if (statusFilter !== '') {
        params.isActive = statusFilter === 'active';
      }
      
      const response = await adminApi.getAllUsers(params);
      
      setUsers(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalUsers(response.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and when filters/pagination change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Open confirmation modal
  const openConfirmModal = (type, user) => {
    setConfirmModal({ isOpen: true, type, user });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, user: null });
  };

  // Activate user
  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true);
      const response = await adminApi.activateUser(userId);
      
      toast.success(response.message || 'User activated successfully');
      
      // Update the user in the list
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isActive: true } : user
        )
      );
    } catch (err) {
      console.error('Error activating user:', err);
      toast.error(err.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  // Deactivate user with confirmation
  const handleDeactivateUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      openConfirmModal('deactivate', user);
    }
  };

  // Confirm deactivate
  const confirmDeactivate = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.deactivateUser(confirmModal.user._id);
      
      toast.success(response.message || 'User deactivated successfully');
      
      // Update the user in the list
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === confirmModal.user._id ? { ...user, isActive: false } : user
        )
      );
      
      closeConfirmModal();
    } catch (err) {
      console.error('Error deactivating user:', err);
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user with confirmation
  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      openConfirmModal('delete', user);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.deleteUser(confirmModal.user._id);
      
      toast.success(response.message || 'User deleted successfully');
      
      // Remove the user from the list
      setUsers(prevUsers => prevUsers.filter(user => user._id !== confirmModal.user._id));
      setTotalUsers(prev => prev - 1);
      
      closeConfirmModal();
      
      // Refresh if current page is empty
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                  User Management
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Manage and monitor all platform users
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{totalUsers}</p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Users</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Inactive Users</p>
              <p className="text-2xl font-bold text-error-600 dark:text-error-400">
                {users.filter(u => !u.isActive).length}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Current Page</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                {currentPage} / {totalPages}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Search User
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name and/or role"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Filter by Role
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text appearance-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="jobseeker">Job Seeker</option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Sort Filters
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Not Active</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          {(searchQuery || roleFilter || statusFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {totalUsers} user(s) found
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No Users Found
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {searchQuery || roleFilter || statusFilter
                ? 'Try adjusting your search criteria or filters'
                : 'No users available in the system'}
            </p>
            {(searchQuery || roleFilter || statusFilter) && (
              <Button onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* User Cards Grid */}
        {!loading && !error && users.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <UserCard
                    user={user}
                    onActivate={handleActivateUser}
                    onDeactivate={handleDeactivateUser}
                    onDelete={handleDeleteUser}
                    loading={actionLoading}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center space-x-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-dark-bg-secondary text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-bg'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title={
          confirmModal.type === 'delete'
            ? 'Confirm Delete User'
            : 'Confirm Deactivate User'
        }
        size="md"
      >
        {confirmModal.user && (
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="flex items-start space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">
                  {confirmModal.type === 'delete'
                    ? 'Warning: This action cannot be undone'
                    : 'Warning: This will prevent the user from accessing their account'}
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                  {confirmModal.type === 'delete'
                    ? 'Deleting this user will permanently remove all their data from the system.'
                    : 'The user will not be able to log in until their account is reactivated.'}
                </p>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                User Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Name
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.user.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Email
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text break-all">
                    {confirmModal.user.email}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Role
                  </p>
                  <Badge
                    variant={
                      confirmModal.user.role === 'admin'
                        ? 'error'
                        : confirmModal.user.role === 'recruiter'
                        ? 'warning'
                        : 'primary'
                    }
                    size="sm"
                  >
                    {confirmModal.user.role}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Status
                  </p>
                  <Badge
                    variant={confirmModal.user.isActive ? 'success' : 'error'}
                    size="sm"
                  >
                    {confirmModal.user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Verified
                  </p>
                  <Badge
                    variant={confirmModal.user.isVerified ? 'success' : 'warning'}
                    size="sm"
                  >
                    {confirmModal.user.isVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Joined
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm">
                    {new Date(confirmModal.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {confirmModal.user.lastLogin && (
                <div className="pt-3 border-t border-light-border dark:border-dark-border">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Last Login
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm">
                    {new Date(confirmModal.user.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-light-border dark:border-dark-border">
              <Button
                variant="outline"
                onClick={closeConfirmModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={confirmModal.type === 'delete' ? confirmDelete : confirmDeactivate}
                disabled={actionLoading}
                className={
                  confirmModal.type === 'delete'
                    ? 'bg-error-600 hover:bg-error-700 text-white'
                    : 'bg-warning-600 hover:bg-warning-700 text-white'
                }
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmModal.type === 'delete' ? 'Delete User' : 'Deactivate User'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
