import { useState, useEffect } from 'react';
import { Search, ShieldCheck, RefreshCw, AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '@api/adminApi';
import RecruiterCard from '@components/admin/RecruiterCard';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import Badge from '@components/common/Badge';
import toast from 'react-hot-toast';

const RecruiterVerification = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const limit = 10;
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'verify' or 'reject'
    profile: null,
    rejectReason: '',
  });

  // Fetch recruiter profiles
  const fetchProfiles = async () => {
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
        params.verificationStatus = statusFilter;
      }
      
      const response = await adminApi.getAllRecruiters(params);
      
      setProfiles(response.data?.profiles || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalProfiles(response.data?.pagination?.totalProfiles || 0);
    } catch (err) {
      console.error('Error fetching recruiters:', err);
      setError(err.response?.data?.message || 'Failed to load recruiter profiles');
      toast.error('Failed to load recruiter profiles');
    } finally {
      setLoading(false);
    }
  };

  // Load profiles on component mount and when filters/pagination change
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchProfiles();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Open confirmation modal
  const openConfirmModal = (type, profile) => {
    setConfirmModal({ isOpen: true, type, profile, rejectReason: '' });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, profile: null, rejectReason: '' });
  };

  // Verify recruiter with confirmation
  const handleVerifyRecruiter = (profileId) => {
    const profile = profiles.find(p => p._id === profileId);
    if (profile) {
      openConfirmModal('verify', profile);
    }
  };

  // Confirm verify
  const confirmVerify = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.verifyRecruiter(confirmModal.profile._id);
      
      toast.success(response.message || 'Recruiter verified successfully');
      
      // Update the profile in the list
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile._id === confirmModal.profile._id 
            ? { ...profile, isVerified: true, verificationStatus: 'verified' } 
            : profile
        )
      );
      
      closeConfirmModal();
    } catch (err) {
      console.error('Error verifying recruiter:', err);
      toast.error(err.response?.data?.message || 'Failed to verify recruiter');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject recruiter with confirmation
  const handleRejectRecruiter = (profileId) => {
    const profile = profiles.find(p => p._id === profileId);
    if (profile) {
      openConfirmModal('reject', profile);
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
      const response = await adminApi.rejectRecruiter(
        confirmModal.profile._id, 
        confirmModal.rejectReason
      );
      
      toast.success(response.message || 'Recruiter verification rejected');
      
      // Update the profile in the list
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile._id === confirmModal.profile._id 
            ? { 
                ...profile, 
                isVerified: false, 
                verificationStatus: 'rejected',
                verificationNotes: confirmModal.rejectReason 
              } 
            : profile
        )
      );
      
      closeConfirmModal();
    } catch (err) {
      console.error('Error rejecting recruiter:', err);
      toast.error(err.response?.data?.message || 'Failed to reject recruiter');
    } finally {
      setActionLoading(false);
    }
  };

  // Visit public profile
  const handleVisitProfile = (profileId) => {
    window.open(`/recruiters/${profileId}/profile`, '_blank');
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Calculate statistics
  const stats = {
    total: totalProfiles,
    pending: profiles.filter(p => p.verificationStatus === 'pending').length,
    verified: profiles.filter(p => p.verificationStatus === 'verified').length,
    rejected: profiles.filter(p => p.verificationStatus === 'rejected').length,
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
                <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                  Recruiter Verification
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Verify and manage recruiter profiles
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={fetchProfiles}
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
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Recruiters</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Pending Verifications</p>
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Verified Recruiters</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {stats.verified}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Rejected Applications</p>
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
                Search by Recruiter Name or Company Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by recruiter name company name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
                />
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
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          {(searchQuery || statusFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {totalProfiles} profile(s) found
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
        {!loading && !error && profiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No Recruiter Profiles Found
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {searchQuery || statusFilter
                ? 'Try adjusting your search criteria or filters'
                : 'No recruiter profiles available in the system'}
            </p>
            {(searchQuery || statusFilter) && (
              <Button onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Recruiter Cards Grid */}
        {!loading && !error && profiles.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RecruiterCard
                    profile={profile}
                    onVerify={handleVerifyRecruiter}
                    onReject={handleRejectRecruiter}
                    onVisitProfile={handleVisitProfile}
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
          confirmModal.type === 'verify'
            ? 'Confirm Recruiter Verification'
            : 'Reject Recruiter Verification'
        }
        size="md"
      >
        {confirmModal.profile && (
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="flex items-start space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">
                  {confirmModal.type === 'verify'
                    ? 'Warning: Verify this recruiter account'
                    : 'Warning: This action will reject the verification request'}
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                  {confirmModal.type === 'verify'
                    ? 'Verifying this recruiter will grant them access to post jobs and manage applications.'
                    : 'The recruiter will be notified of the rejection and will need to reapply for verification.'}
                </p>
              </div>
            </div>

            {/* Recruiter Profile Details */}
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                Recruiter Profile Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Company Name
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.profile.companyName}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Recruiter Name
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.profile.userId?.name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Email
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text break-all text-sm">
                    {confirmModal.profile.userId?.email || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Industry
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.profile.industry || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Company Size
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {confirmModal.profile.companySize || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Status
                  </p>
                  <Badge
                    variant={
                      confirmModal.profile.verificationStatus === 'verified'
                        ? 'success'
                        : confirmModal.profile.verificationStatus === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                  >
                    {confirmModal.profile.verificationStatus}
                  </Badge>
                </div>
                
                <div className="col-span-2">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Website
                  </p>
                  <a 
                    href={confirmModal.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 dark:text-primary-400 hover:underline text-sm break-all"
                  >
                    {confirmModal.profile.website || 'N/A'}
                  </a>
                </div>
                
                <div className="col-span-2">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Location
                  </p>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm">
                    {confirmModal.profile.location 
                      ? `${confirmModal.profile.location.city}, ${confirmModal.profile.location.state}, ${confirmModal.profile.location.country}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Reason (only for reject) */}
            {confirmModal.type === 'reject' && (
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
                onClick={confirmModal.type === 'verify' ? confirmVerify : confirmReject}
                disabled={actionLoading}
                className={
                  confirmModal.type === 'verify'
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
                    {confirmModal.type === 'verify' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Recruiter
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Application
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

export default RecruiterVerification;
