import { useState, useEffect } from 'react';
import { Search, Tag, RefreshCw, AlertCircle, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '@api/adminApi';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [createEditModal, setCreateEditModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    category: null,
  });
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
    forceDelete: false,
  });
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    icon: '',
    isActive: true,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        view: 'flat', // flat view to show all categories with level info
        limit: 100, // Get all categories
        includeInactive: true // Admin should see all
      };
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      
      const response = await adminApi.getAllCategories(params);
      // API returns { success: true, count: N, data: [...] }
      // So response.data is the array of categories (per README and axios response structure logic)
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Load categories on mount and when search changes
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Open create modal
  const handleCreateCategory = () => {
    setFormData({ name: '', description: '', parentCategory: '', icon: '', isActive: true });
    setCreateEditModal({ isOpen: true, mode: 'create', category: null });
  };

  // Open edit modal
  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      // Handle populated object or ID string for parentCategory
      parentCategory: category.parentCategory?._id || category.parentCategory || '', 
      icon: category.icon || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setCreateEditModal({ isOpen: true, mode: 'edit', category });
  };

  // Close create/edit modal
  const closeCreateEditModal = () => {
    setCreateEditModal({ isOpen: false, mode: 'create', category: null });
    setFormData({ name: '', description: '', parentCategory: '', icon: '', isActive: true });
  };

  // Submit create/edit
  const submitCreateEdit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (formData.description.length > 500) {
      toast.error('Description must be less than 500 characters');
      return;
    }

    try {
      setActionLoading(true);
      
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim(),
        isActive: formData.isActive
      };
      
      // Only include parentCategory if it's not empty, otherwise null for root
      if (formData.parentCategory) {
        data.parentCategory = formData.parentCategory;
      } else {
        data.parentCategory = null; 
      }
      
      let response;
      if (createEditModal.mode === 'create') {
        response = await adminApi.createCategory(data);
        toast.success(response.message || 'Category created successfully');
      } else {
        response = await adminApi.updateCategory(createEditModal.category._id, data);
        toast.success(response.message || 'Category updated successfully');
      }
      
      // Refresh categories list
      await fetchCategories();
      closeCreateEditModal();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete modal
  const handleDeleteCategory = (category) => {
    setDeleteModal({ isOpen: true, category, forceDelete: false });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null, forceDelete: false });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.deleteCategory(
        deleteModal.category._id,
        deleteModal.forceDelete
      );
      
      toast.success(response.message || 'Category deleted successfully');
      
      // Refresh categories list
      await fetchCategories();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
      
      // If error mentions dependencies, don't close modal (let user try force delete if relevant)
    } finally {
      setActionLoading(false);
    }
  };

  // Get parent category options (excluding self and descendants)
  const getParentOptions = (currentCategoryId = null) => {
    if (!currentCategoryId) {
      // For create mode, return all top-level and level-1 categories
      return categories.filter(cat => (cat.level || 0) <= 1);
    }
    
    // For edit mode, exclude the category itself and its children
    return categories.filter(cat => {
      const parentId = cat.parentCategory?._id || cat.parentCategory;
      return cat._id !== currentCategoryId && 
             parentId !== currentCategoryId &&
             (cat.level || 0) <= 1;
    });
  };

  // Get indent class based on level
  const getIndentClass = (level) => {
    const indents = {
      0: 'pl-4',
      1: 'pl-8',
      2: 'pl-12',
      3: 'pl-16',
    };
    return indents[level] || 'pl-4';
  };

  // Calculate statistics
  const stats = {
    total: categories.length,
    topLevel: categories.filter(c => !c.parentCategory).length,
    subcategories: categories.filter(c => c.parentCategory).length,
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
                <Tag className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                  Category Management
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Manage job categories and subcategories
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={fetchCategories}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button
                variant="primary"
                onClick={handleCreateCategory}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Categories</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Top-Level Categories</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {stats.topLevel}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Subcategories</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {stats.subcategories}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-6 mb-6"
        >
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Search Categories
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by category name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
            />
          </div>
          
          {searchQuery && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} found
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
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
        {!loading && !error && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border p-12 text-center"
          >
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No Categories Found
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first category'}
            </p>
            <Button onClick={searchQuery ? () => setSearchQuery('') : handleCreateCategory}>
              {searchQuery ? 'Clear Search' : 'Add Category'}
            </Button>
          </motion.div>
        )}

        {/* Categories Table */}
        {!loading && !error && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {categories.map((category, index) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                    >
                      <td className={`px-6 py-4 ${getIndentClass(category.level || 0)}`}>
                        <div className="flex items-center space-x-2">
                          {(category.level || 0) > 0 && (
                            <span className="text-gray-400">└─</span>
                          )}
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-1">
                          {category.description || 'No description'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200">
                          Level {category.level || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
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
        )}
      </div>
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={closeCreateEditModal}
        title={createEditModal.mode === 'create' ? 'Create Category' : 'Edit Category'}
        size="md"
      >
        <div className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Category Name <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Machine Learning"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this category"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} / 500 characters
            </p>
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Parent Category (Optional)
            </label>
            <select
              value={formData.parentCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, parentCategory: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text"
            >
              <option value="">None (Top-level category)</option>
              {getParentOptions(createEditModal.category?._id).map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.level > 0 ? '└─ ' : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Icon (Optional)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="e.g., brain, code, briefcase"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-light-text dark:text-dark-text placeholder-gray-400"
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
                createEditModal.mode === 'create' ? 'Create Category' : 'Update Category'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Category"
        size="md"
      >
        {deleteModal.category && (
          <div className="space-y-6">
            {/* Warning */}
            <div className="flex items-start space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                  Deleting this category will remove it from the system.
                  If it has subcategories or active jobs, you may need to resolve those first.
                </p>
              </div>
            </div>

            {/* Category Details */}
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                Category Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Name: </span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {deleteModal.category.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Level: </span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {deleteModal.category.level || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Force Delete Option (Only visual for now as API handles strict checks) */}
            {/* Note: The API delete endpoint supports force=true/false. We expose it here. */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="forceDelete"
                checked={deleteModal.forceDelete}
                onChange={(e) => setDeleteModal(prev => ({ ...prev, forceDelete: e.target.checked }))}
                className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="forceDelete" className="text-sm text-light-text dark:text-dark-text">
                <span className="font-medium">Force delete</span>
                <span className="block text-xs text-warning-600 dark:text-warning-400 mt-1">
                   Try to delete ignoring checks (Use with caution).
                </span>
              </label>
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
                  'Delete Category'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryManagement;
