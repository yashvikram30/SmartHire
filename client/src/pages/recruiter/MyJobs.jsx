import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Search, Filter, Plus, MoreVertical, 
  Eye, Users, Calendar, Edit, Trash2, XCircle,
  CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { recruiterApi } from '@api/recruiterApi';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    active: 0,
    'pending-approval': 0,
    closed: 0,
    rejected: 0,
    draft: 0
  });

  // Filters & Pagination
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });
  
  const [pagination, setPagination] = useState({
    totalJobs: 0,
    totalPages: 1,
    currentPage: 1
  });

  // Modals
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null, jobTitle: '' });
  const [closeModal, setCloseModal] = useState({ isOpen: false, jobId: null, jobTitle: '' });

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Build params object strictly according to README
      // Default sort is handled by backend (createdAt desc)
      const params = {
        page: filters.page,
        limit: filters.limit
      };
      
      // Only add status if specific filter is selected
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await recruiterApi.getMyJobs(params);
      
      if (response.success) {
        setJobs(response.data || []);
        setPagination({
          totalJobs: response.totalJobs || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1
        });
        if (response.statusSummary) {
          setStats(response.statusSummary);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters.page, filters.status]);

  // Actions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await recruiterApi.updateJob(jobId, { status: newStatus });
      toast.success(`Job status updated to ${newStatus}`);
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    try {
      setActionLoading(true);
      await recruiterApi.deleteJob(deleteModal.jobId);
      toast.success('Job deleted successfully');
      setDeleteModal({ isOpen: false, jobId: null, jobTitle: '' });
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseJob = async () => {
    try {
      setActionLoading(true);
      await recruiterApi.closeJob(closeModal.jobId, { reason: 'closed' });
      toast.success('Job closed successfully');
      setCloseModal({ isOpen: false, jobId: null, jobTitle: '' });
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('Close error:', error);
      toast.error(error.response?.data?.message || 'Failed to close job');
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge Logic
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>;
      case 'pending-approval':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center"><Edit className="w-3 h-3 mr-1"/> Draft</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center"><XCircle className="w-3 h-3 mr-1"/> Closed</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Job Postings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and track your job listings
            </p>
          </div>
          <Link to="/recruiter/post-job">
            <Button variant="primary" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: pagination.totalJobs, color: 'bg-blue-50 text-blue-700' },
            { label: 'Active', value: stats.active || 0, color: 'bg-green-50 text-green-700' },
            { label: 'Pending', value: stats['pending-approval'] || 0, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Drafts', value: stats.draft || 0, color: 'bg-gray-50 text-gray-700' },
            { label: 'Closed', value: stats.closed || 0, color: 'bg-red-50 text-red-700' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-lg border border-gray-100 dark:border-gray-800 ${stat.color} dark:bg-opacity-10`}>
              <p className="text-xs font-medium uppercase tracking-wider opacity-80">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-light-border dark:border-dark-border mb-6 p-2">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'active', label: 'Active' },
              { id: 'pending-approval', label: 'Pending' },
              { id: 'draft', label: 'Drafts' },
              { id: 'closed', label: 'Closed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filters.status === tab.id
                    ? 'bg-primary-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-dark-bg-secondary rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              {filters.status !== 'all' ? `You don't have any ${filters.status} jobs.` : "You haven't posted any jobs yet. Create a job to get started!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {jobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-light-border dark:border-dark-border p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                           <Link to={`/recruiter/jobs/${job._id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                             {job.title}
                           </Link>
                         </h3>
                         {getStatusBadge(job.status)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center" title="Total Views">
                          <Eye className="w-4 h-4 mr-1.5 text-gray-400" /> {job.views || 0}
                        </span>
                        <span className="flex items-center" title="Applications Received">
                          <Users className="w-4 h-4 mr-1.5 text-gray-400" /> {job.applicationCount || 0}
                        </span>
                        <span className="flex items-center" title="Posted Date">
                          <Calendar className="w-4 h-4 mr-1.5 text-gray-400" /> {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                           {job.employmentType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start pt-1">
                      {job.status === 'draft' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          onClick={() => handleStatusUpdate(job._id, 'pending-approval')}
                          title="Submit for Approval"
                        >
                          <ArrowUpCircle className="w-4 h-4 mr-1.5" /> Submit
                        </Button>
                      )}

                      {job.status === 'pending-approval' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          onClick={() => handleStatusUpdate(job._id, 'draft')}
                          title="Withdraw to Draft"
                        >
                          <ArrowDownCircle className="w-4 h-4 mr-1.5" /> Withdraw
                        </Button>
                      )}

                      <Link to={`/recruiter/jobs/${job._id}`}>
                        <Button variant="outline" size="sm" className="flex items-center border-gray-300 dark:border-gray-600">
                          <Edit className="w-3 h-3 mr-1.5" /> Manage
                        </Button>
                      </Link>
                      
                      {job.status === 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => setCloseModal({ isOpen: true, jobId: job._id, jobTitle: job.title })}
                          title="Close Job"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                         className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                         onClick={() => setDeleteModal({ isOpen: true, jobId: job._id, jobTitle: job.title })}
                         title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                 >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, jobId: null, jobTitle: '' })}
        title="Delete Job Posting"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-900 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              Are you sure you want to delete <strong>{deleteModal.jobTitle}</strong>? 
              This action cannot be undone and will remove all associated applications.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
             <Button 
              variant="ghost" 
              onClick={() => setDeleteModal({ isOpen: false, jobId: null, jobTitle: '' })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={handleDeleteJob}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Job'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Confirmation Modal */}
      <Modal
        isOpen={closeModal.isOpen}
        onClose={() => setCloseModal({ isOpen: false, jobId: null, jobTitle: '' })}
        title="Close Job Posting"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to close <strong>{closeModal.jobTitle}</strong>? 
            Candidates will no longer be able to apply, but existing applications will be preserved.
          </p>
          <div className="flex justify-end space-x-3">
             <Button 
              variant="ghost" 
              onClick={() => setCloseModal({ isOpen: false, jobId: null, jobTitle: '' })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="bg-orange-600 hover:bg-orange-700 text-white border-none"
              onClick={handleCloseJob}
              disabled={actionLoading}
            >
              {actionLoading ? 'Closing...' : 'Close Job'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default MyJobs;
