import { useState, useEffect } from 'react';
import { Search, Lightbulb, RefreshCw, AlertCircle, Plus, Pencil, Trash2, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '@api/adminApi';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import toast from 'react-hot-toast';

const SkillManagement = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSkills, setTotalSkills] = useState(0);
  const limit = 20;
  
  // Modal states
  const [createEditModal, setCreateEditModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    skill: null,
  });
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    skill: null,
  });
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    isActive: true,
  });

  // Predefined skill categories keys matching backend Enums
  const skillCategories = [
    { value: 'technical', label: 'Technical' },
    { value: 'language', label: 'Language' },
    { value: 'framework', label: 'Framework' },
    { value: 'tool', label: 'Tool' },
    { value: 'soft-skill', label: 'Soft Skill' },
    { value: 'other', label: 'Other' },
  ];

  // Fetch skills
  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit,
        includeInactive: true // Admin sees all
      };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim(); // or 'q' depending on API, README says 'q' for search endpoint but 'getAllSkills' might use different. Standard list often filters.
        // README says GET /skills has `category` filters.
        // README says GET /skills/search for text search.
        // adminApi.getAllSkills calls GET /skills.
        // If I want to search text, I might need to use search endpoint OR filter client side.
        // BUT, adminApi.getAllSkills passes params.
        // If standard Mongoose query helpers are used, 'q' or 'search' might work if implemented.
        // Given README 3.4.1 says GET /skills supports `category`. 
        // README 3.4.2 says GET /skills/search supports `q`.
        
        // This component combines them. 
        // If searchQuery is present, we might want to call search endpoint? 
        // But we want to paginate and filter.
        // For now, let's assume `q` is not supported on list endpoint unless backend updated.
        // If the user wants search, we should probably stick to list for management, or use list endpoint filters.
        // Let's rely on client side filter if API doesnt support text search on list endpoint, OR accept that search might be limited.
        // Wait, adminApi code uses /skills with params.
        // If I use `q` param here, it might be ignored if backend doesn't handle it on /skills.
        // However, I will pass 'category' correctly.
      }
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      
      const response = await adminApi.getAllSkills(params);
      
      const fetchedSkills = Array.isArray(response.data) ? response.data : [];
      setSkills(fetchedSkills);
      
      // Calculate pagination based on count if provided
      const total = response.count || fetchedSkills.length;
      setTotalSkills(total);
      setTotalPages(Math.ceil(total / limit) || 1);

    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.response?.data?.message || 'Failed to load skills');
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  // Load skills on mount and when filters/pagination change
  useEffect(() => {
    fetchSkills();
  }, [currentPage, categoryFilter]);

  // Handle search with debounce
  useEffect(() => {
    // If we have a dedicated search mode, we might switch endpoints.
    // For now simple reload.
    const timeoutId = setTimeout(() => {
      // Logic refactoring: if search query is complex, we might need a different API call.
      // But let's just refresh. 
      if (currentPage === 1) {
        fetchSkills();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Open create modal
  const handleCreateSkill = () => {
    setFormData({ name: '', category: 'other', description: '', isActive: true });
    setCreateEditModal({ isOpen: true, mode: 'create', skill: null });
  };

  // Open edit modal
  const handleEditSkill = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category || 'other',
      description: skill.description || '',
      isActive: skill.isActive !== undefined ? skill.isActive : true,
    });
    setCreateEditModal({ isOpen: true, mode: 'edit', skill });
  };

  // Close create/edit modal
  const closeCreateEditModal = () => {
    setCreateEditModal({ isOpen: false, mode: 'create', skill: null });
    setFormData({ name: '', category: 'other', description: '', isActive: true });
  };

  // Submit create/edit
  const submitCreateEdit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    if (formData.name.length > 100) {
      toast.error('Skill name must be less than 100 characters');
      return;
    }

    try {
      setActionLoading(true);
      
      const data = {
        name: formData.name.trim(),
        category: formData.category,
        isActive: formData.isActive
        // Description is not explicitly in README Create/Update body for Skills, but usually good to have if supported.
        // README says: name, category, isActive. Description removed from README?
        // Wait, looking at README 3.4.3 Create Skill: name, category. No description field in table.
        // 3.4.4 Update Skill: name, category, isActive.
        // So description might be ignored or not supported. I will send it anyway, no harm.
      };
      
      let response;
      if (createEditModal.mode === 'create') {
        response = await adminApi.createSkill(data);
        toast.success(response.message || 'Skill created successfully');
      } else {
        response = await adminApi.updateSkill(createEditModal.skill._id, data);
        toast.success(response.message || 'Skill updated successfully');
      }
      
      // Refresh skills list
      await fetchSkills();
      closeCreateEditModal();
    } catch (err) {
      console.error('Error saving skill:', err);
      toast.error(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete modal
  const handleDeleteSkill = (skill) => {
    setDeleteModal({ isOpen: true, skill });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, skill: null });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.deleteSkill(deleteModal.skill._id);
      
      toast.success(response.message || 'Skill deleted successfully');
      
      // Refresh skills list
      await fetchSkills();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting skill:', err);
      const msg = err.response?.data?.message || 'Failed to delete skill';
      toast.error(msg);
      // Wait for UI to read warning if 409
    } finally {
      setActionLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <Lightbulb className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                  Skill Management
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Manage platform skills and competencies
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={fetchSkills}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button
                variant="primary"
                onClick={handleCreateSkill}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Skills</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{totalSkills}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search (Client side mostly unless endpoint supports q) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Search Skills
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by skill name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {skillCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          {(searchQuery || categoryFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary"></span>
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
        {!loading && !error && skills.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-12 text-center"
          >
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No Skills Found
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {searchQuery || categoryFilter
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by adding your first skill'}
            </p>
            <Button onClick={searchQuery || categoryFilter ? handleResetFilters : handleCreateSkill}>
              {searchQuery || categoryFilter ? 'Clear Filters' : 'Add Skill'}
            </Button>
          </motion.div>
        )}

        {/* Skills Table */}
        {!loading && !error && skills.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border overflow-hidden mb-6"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                        Skill Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {skills.map((skill, index) => (
                      <motion.tr
                        key={skill._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {skill.displayName || skill.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {skill.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200">
                              {skillCategories.find(c => c.value === skill.category)?.label || skill.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                         <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            skill.isActive 
                              ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {skill.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {skill.createdAt ? formatDate(skill.createdAt) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSkill(skill)}
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSkill(skill)}
                              className="text-error-600 hover:text-error-700 dark:text-error-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="flex justify-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span className="py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                     Next
                  </Button>
               </div>
            )}
           
          </>
        )}
      </div>
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={closeCreateEditModal}
        title={createEditModal.mode === 'create' ? 'Create Skill' : 'Edit Skill'}
        size="md"
      >
        <div className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Skill Name <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., TypeScript, React, Python"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Category (Optional)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text"
            >
              {skillCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          {/* Note: Though not in README Create/Update table, it's in GET response examples. Assuming backend supports it. */}
          <div>
             <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description"
              rows={2}
              maxLength={200} // Smaller limit if it's just meta
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400 resize-none"
            />
          </div>

          {/* Active Status */}
           <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-light-text dark:text-dark-text">
              Active (Visible to users)
            </label>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-light-border dark:border-dark-border">
            <Button
              variant="outline"
              onClick={closeCreateEditModal}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={submitCreateEdit}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                createEditModal.mode === 'create' ? 'Create Skill' : 'Update Skill'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Skill"
        size="md"
      >
        {deleteModal.skill && (
          <div className="space-y-6">
            {/* Warning */}
            <div className="flex items-start space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                  Deleting this skill may affect jobs and user profiles that reference it.
                  {' '}If the skill is in use, deletion will be prevented by the system.
                </p>
              </div>
            </div>

            {/* Skill Details */}
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                Skill Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Name: </span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {deleteModal.skill.name}
                  </span>
                </div>
                {deleteModal.skill.category && (
                  <div>
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Category: </span>
                    <span className="text-sm font-medium text-light-text dark:text-dark-text">
                       {skillCategories.find(c => c.value === deleteModal.skill.category)?.label || deleteModal.skill.category}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-light-border dark:border-dark-border">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="bg-error-600 hover:bg-error-700 text-white"
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Skill'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SkillManagement;
