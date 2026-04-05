import { useState, useEffect } from 'react';
import { Search, Briefcase, RefreshCw, AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '@api/adminApi';
import JobCard from '@components/admin/JobCard';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import Badge from '@components/common/Badge';
import toast from 'react-hot-toast';

const JobModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const limit = 10;
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'approve' or 'reject'
    job: null,
    rejectReason: '',
    rejectCategory: '',
  });

  // Fetch jobs
  const fetchJobs = async () => {
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
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await adminApi.getAllJobs(params);
      
      setJobs(response.data?.jobs || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalJobs(response.data?.pagination?.totalJobs || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to load job postings');
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  // Load jobs on component mount and when filters/pagination change
  useEffect(() => {
    fetchJobs();
  }, [currentPage, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchJobs();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Open confirmation modal
  const openConfirmModal = (type, job) => {
    setConfirmModal({ isOpen: true, type, job, rejectReason: '', rejectCategory: '' });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, job: null, rejectReason: '', rejectCategory: '' });
  };

  // Approve job with confirmation
  const handleApproveJob = (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    if (job) {
      openConfirmModal('approve', job);
    }
  };

  // Confirm approve
  const confirmApprove = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.approveJob(confirmModal.job._id);
      
      toast.success(response.message || 'Job approved successfully');
      
      // Update the job in the list
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === confirmModal.job._id 
            ? { ...job, status: 'active' } 
            : job
        )
      );
      
      closeConfirmModal();
    } catch (err) {
      console.error('Error approving job:', err);
      toast.error(err.response?.data?.message || 'Failed to approve job');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject job with confirmation
  const handleRejectJob = (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    if (job) {
      openConfirmModal('reject', job);
    }
  };

  // Confirm reject
  const confirmReject = async () => {
    if (!confirmModal.rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (confirmModal.rejectReason.length > 1000) {
      toast.error('Rejection reason must be less than 1000 characters');
      return;
    }

    try {
      setActionLoading(true);
      
      const payload = {
        notes: confirmModal.rejectReason,
      };
      
      if (confirmModal.rejectCategory) {
        payload.reason = confirmModal.rejectCategory;
      }
      
      const response = await adminApi.rejectJob(confirmModal.job._id, payload);
      
      toast.success(response.message || 'Job rejected successfully');
      
      // Update the job in the list
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === confirmModal.job._id 
            ? { 
                ...job, 
                status: 'rejected',
                moderationNotes: confirmModal.rejectReason 
              } 
            : job
        )
      );
      
      closeConfirmModal();
    } catch (err) {
      console.error('Error rejecting job:', err);
      toast.error(err.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  // View full job
  const handleViewJob = (jobId) => {
    window.open(`/jobs/${jobId}`, '_blank');
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Calculate statistics
  const stats = {
    total: totalJobs,
    pending: jobs.filter(j => j.status === 'pending-approval' || j.status === 'pending').length,
    active: jobs.filter(j => j.status === 'active').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
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
                <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                  Job Moderation
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Review and moderate job postings
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={fetchJobs}
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
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Jobs</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Pending Approval</p>
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Jobs</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {stats.active}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Rejected Jobs</p>
              <p className="text-2xl font-bold text-error-600 dark:text-error-400">
                {stats.rejected}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Search by Job Title or Company Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title or company name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Status Filter
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
                <option value="pending-approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          {(searchQuery || statusFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {totalJobs} job(s) found
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
        {!loading && !error && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No Job Postings Found
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {searchQuery || statusFilter
                ? 'Try adjusting your search criteria or filters'
                : 'No job postings available in the system'}
            </p>
            {(searchQuery || statusFilter) && (
              <Button onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Job Cards Grid */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard
                    job={job}
                    onApprove={handleApproveJob}
                    onReject={handleRejectJob}
                    onViewJob={handleViewJob}
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
          confirmModal.type === 'approve'
            ? 'Confirm Job Approval'
            : 'Reject Job Posting'
        }
        size="md"
      >
        {confirmModal.job && (
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="flex items-start space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">
                  {confirmModal.type === 'approve'
                    ? 'Warning: Approve this job posting'
                    : 'Warning: This action will reject the job posting'}
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                  {confirmModal.type === 'approve'
                    ? 'Approving this job will make it visible to job seekers and active in the system.'
                    : 'The recruiter will be notified of the rejection and will need to make changes before resubmitting.'}
                </p>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                Job Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Job Title
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.job.title}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Company Name
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.job.companyId?.companyName || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Industry
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.job.companyId?.industry || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Posted By
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.job.recruiterId?.name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Recruiter Email
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm break-all">
                    {confirmModal.job.recruiterId?.email || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Status
                  </p>
                  <Badge
                    variant={
                      confirmModal.job.status === 'active'
                        ? 'success'
                        : confirmModal.job.status === 'pending-approval' || confirmModal.job.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                  >
                    {confirmModal.job.status === 'pending-approval' ? 'Pending' : confirmModal.job.status}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Salary Range
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm">
                    {confirmModal.job.salary
                      ? `${confirmModal.job.salary.currency} ${confirmModal.job.salary.min?.toLocaleString()} - ${confirmModal.job.salary.max?.toLocaleString()}`
                      : 'Not specified'}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Location
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm">
                    {confirmModal.job.location
                      ? `${confirmModal.job.location.city}, ${confirmModal.job.location.state}, ${confirmModal.job.location.country}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Fields (only for reject) */}
            {confirmModal.type === 'reject' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                    Rejection Category (Optional)
                  </label>
                  <select
                    value={confirmModal.rejectCategory}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, rejectCategory: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text"
                  >
                    <option value="">Select a category</option>
                    <option value="Content Guidelines Violation">Content Guidelines Violation</option>
                    <option value="Incomplete Information">Incomplete Information</option>
                    <option value="Duplicate Posting">Duplicate Posting</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                    Rejection Reason <span className="text-error-600">*</span>
                  </label>
                  <textarea
                    value={confirmModal.rejectReason}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, rejectReason: e.target.value }))}
                    placeholder="Please provide a detailed reason for rejection (max 1000 characters)"
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {confirmModal.rejectReason.length} / 1000 characters
                  </p>
                </div>
              </div>
            )}

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
                onClick={confirmModal.type === 'approve' ? confirmApprove : confirmReject}
                disabled={actionLoading}
                className={
                  confirmModal.type === 'approve'
                    ? 'bg-success-600 hover:bg-success-700 text-white'
                    : 'bg-error-600 hover:bg-error-700 text-white'
                }
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmModal.type === 'approve' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Job
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Job
                      </>
                    )}
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

export default JobModeration;
